/**
 * Otomatik haber hattı: RSS'ten emekli haberlerini çeker, Claude ile özgün
 * olarak yeniden yazar, markalı kapak üretir ve TASLAK olarak kaydeder.
 * Hiçbir şey kendiliğinden yayınlanmaz; editör panelden onaylar.
 */
import { haberiYenidenYaz, yenidenYazilmisHtml } from "@/lib/ai-revise";
import { tara } from "@/lib/scrape";
import { scrapeConfigFromSettings } from "@/lib/scrape-config";
import { SITE_ORIGIN } from "@/lib/site";
import { slugify } from "@/lib/slugify";
import { createArticle, getAuthors, getCategories, updateTenantSettings } from "@/lib/store";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { lookupTenantByHostname } from "@/lib/tenant-lookup";
import type { Json } from "@/types/db";
import { KAPAK_H, KAPAK_W, kapakUret } from "./kapak";

const BUCKET = "article-images";
/**
 * Hobby planda cron günde bir kez çalışır: bir turda en fazla bu kadar haber
 * Claude'a gider, aynı anda EŞZAMANLI kadarı işlenir (300 sn sınırı).
 */
const TUR_BASINA_HABER = 12;
const ESZAMANLI = 4;
/** Tekrar okunmasın diye hatırlanan link sayısı. */
const HAFIZA = 600;
const AYAR_ANAHTARI = "otomatikCekim";

/**
 * RSS anahtar kelime filtresi gövdede tek bir "SGK" geçse bile eşleşir.
 * Claude'a (ücretli) gitmeden önce: başlıkta emekli konusu olsun ya da
 * gövde konuyu en az 3 kez ansın.
 */
const KONU = /emekli|sgk|ssk|ba[gğ]-?kur|eyt|ikramiye|intibak|prim g[uü]n|ayl[ıi]k ba[gğ]la|maa[sş] ba[gğ]la/gi;
export function emekliKonusuMu(baslik: string, govde: string) {
  if (new RegExp(KONU.source, "i").test(baslik)) return true;
  return (govde.match(KONU)?.length ?? 0) >= 3;
}

export type HatSonucu = {
  taslaklar: { baslik: string; id: string }[];
  elenen: number;
  hatalar: string[];
  mesaj: string;
};

function ayarlar(settings: Json): Record<string, unknown> {
  return settings && typeof settings === "object" && !Array.isArray(settings)
    ? { ...(settings as Record<string, unknown>) }
    : {};
}

function islenenler(settings: Record<string, unknown>): string[] {
  const blok = settings[AYAR_ANAHTARI];
  if (!blok || typeof blok !== "object") return [];
  const liste = (blok as Record<string, unknown>).islenenler;
  return Array.isArray(liste) ? liste.filter((x): x is string => typeof x === "string") : [];
}

async function kapakYukle(tenantId: string, slug: string, png: Buffer) {
  const supabase = createSupabaseAdminClient();
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const path = `${tenantId}/${slug.slice(0, 60).replace(/-+$/, "")}-${unique}.png`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, png, { contentType: "image/png", upsert: true });
  if (error) throw new Error(`Kapak yüklenemedi: ${error.message}`);
  const url = new URL(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
  url.searchParams.set("w", String(KAPAK_W));
  url.searchParams.set("h", String(KAPAK_H));
  return url.toString();
}

export async function haberHattiniCalistir(): Promise<HatSonucu> {
  const tenant = await lookupTenantByHostname(new URL(SITE_ORIGIN).hostname);
  if (!tenant) throw new Error("Tenant bulunamadı.");
  const tenantId = tenant.tenant_id;
  const settings = ayarlar(tenant.settings);

  const hafiza = new Set(islenenler(settings));
  const { config } = scrapeConfigFromSettings(tenant.settings);
  const tarama = await tara(config, (link) => hafiza.has(link));

  const kategoriler = (await getCategories(tenantId)).filter((c) => c.slug !== "blog");
  const yazar = (await getAuthors(tenantId)).find((a) => a.name === "Emekli Haber Merkezi");

  const adaylar = tarama.haberler.filter((h) => emekliKonusuMu(h.baslik, h.govde));
  const eslesen = new Set(adaylar.map((h) => h.link));
  // Anahtar kelimeye uymayanlar bir daha indirilmesin.
  for (const link of tarama.okunanlar) if (!eslesen.has(link)) hafiza.add(link);

  const sonuc: HatSonucu = { taslaklar: [], elenen: 0, hatalar: [], mesaj: "" };

  const isle = async (haber: (typeof adaylar)[number]) => {
    try {
      const yazi = await haberiYenidenYaz(
        haber,
        kategoriler.map((c) => c.slug)
      );
      if (!yazi.uygun) {
        sonuc.elenen += 1;
        hafiza.add(haber.link);
        return;
      }
      const kategori = kategoriler.find((c) => c.slug === yazi.kategori);
      const slug = slugify(yazi.baslik);
      const png = await kapakUret(yazi.kapakBasligi, kategori?.name ?? "Emekli Haberleri");
      const coverUrl = await kapakYukle(tenantId, slug, png);

      const taslak = await createArticle(tenantId, {
        title: yazi.baslik,
        slug,
        excerpt: yazi.ozet,
        content_html: yenidenYazilmisHtml(yazi),
        cover_url: coverUrl,
        cover_alt: yazi.kapakBasligi,
        category_id: kategori?.id ?? null,
        author_id: yazar?.id ?? null,
        status: "draft",
        type: "news",
        meta_title: yazi.metaBaslik,
        meta_description: yazi.metaAciklama,
        kaynaklar: [{ etiket: haber.kaynak, url: haber.link, dofollow: false }],
      });
      hafiza.add(haber.link);
      sonuc.taslaklar.push({ baslik: taslak.title, id: taslak.id });
    } catch (err) {
      // Hafızaya eklenmez: bir sonraki turda yeniden denenir.
      sonuc.hatalar.push(`${haber.baslik}: ${err instanceof Error ? err.message : "hata"}`);
    }
  };

  const sira = adaylar.slice(0, TUR_BASINA_HABER);
  for (let i = 0; i < sira.length; i += ESZAMANLI) {
    await Promise.all(sira.slice(i, i + ESZAMANLI).map(isle));
  }

  settings[AYAR_ANAHTARI] = {
    islenenler: [...hafiza].slice(-HAFIZA),
    sonCalisma: new Date().toISOString(),
  };
  await updateTenantSettings(tenantId, settings);

  sonuc.mesaj = `${tarama.tarandi} sayfa okundu, ${adaylar.length} emekli haberi, ${sonuc.taslaklar.length} taslak, ${sonuc.elenen} elendi, ${sonuc.hatalar.length} hata.`;
  return sonuc;
}
