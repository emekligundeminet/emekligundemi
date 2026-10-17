/**
 * Otomatik haber hattı: RSS'ten emekli haberlerini çeker, markalı kapak
 * üretir ve TASLAK olarak kaydeder. Hiçbir şey kendiliğinden yayınlanmaz.
 *
 * İki mod:
 * - ANTHROPIC_API_KEY varsa Claude haberi özgün olarak yeniden yazar.
 * - Yoksa ham metin taslağa düşer; editör yayından önce kendisi özgünleştirir.
 */
import { haberiYenidenYaz, yenidenYazilmisHtml } from "@/lib/ai-revise";
import { govdeToHtml, haberSlug } from "@/lib/haber-draft";
import { tara, type CekilenHaber } from "@/lib/scrape";
import { scrapeConfigFromSettings } from "@/lib/scrape-config";
import { SITE_ORIGIN } from "@/lib/site";
import { slugify } from "@/lib/slugify";
import { createArticle, getAuthors, getCategories } from "@/lib/store";
import { lookupTenantByHostname } from "@/lib/tenant-lookup";
import type { Json } from "@/types/db";
import { kapakUret } from "./kapak";
import { emekliKonusuMu, kapakIcinKisalt, kategoriTahmin, otomatikOzet } from "./konu";
import { ayarlariGuncelle, kapakYukle, stokAltlari, stokListele, stokSec, stokVeri } from "./stok";

/**
 * Hobby planda cron günde bir kez çalışır: bir turda en fazla bu kadar haber
 * Claude'a gider, aynı anda EŞZAMANLI kadarı işlenir (300 sn sınırı).
 */
const TUR_BASINA_HABER = 12;
const ESZAMANLI = 4;
/** Tekrar okunmasın diye hatırlanan link sayısı. */
const HAFIZA = 600;
const AYAR_ANAHTARI = "otomatikCekim";
/** Aynı stok fotoğraf bu kadar haber boyunca tekrar seçilmez (havuz yeterliyse). */
const STOK_TEKRAR = 8;

export type HatSonucu = {
  mod: "claude" | "ham";
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

function ayarListesi(settings: Record<string, unknown>, alan: string): string[] {
  const blok = settings[AYAR_ANAHTARI];
  if (!blok || typeof blok !== "object") return [];
  const liste = (blok as Record<string, unknown>)[alan];
  return Array.isArray(liste) ? liste.filter((x): x is string => typeof x === "string") : [];
}

export async function haberHattiniCalistir(): Promise<HatSonucu> {
  const tenant = await lookupTenantByHostname(new URL(SITE_ORIGIN).hostname);
  if (!tenant) throw new Error("Tenant bulunamadı.");
  const tenantId = tenant.tenant_id;
  const settings = ayarlar(tenant.settings);

  const hafiza = new Set(ayarListesi(settings, "islenenler"));
  const sonStoklar = ayarListesi(settings, "sonStoklar");
  const { config } = scrapeConfigFromSettings(tenant.settings);
  const tarama = await tara(config, (link) => hafiza.has(link));

  const kategoriler = (await getCategories(tenantId)).filter((c) => c.slug !== "blog");
  const yazar = (await getAuthors(tenantId)).find((a) => a.name === "Emekli Haber Merkezi");
  // Stok listesi alınamazsa kırmızı kapakla devam edilir.
  const stoklar = await stokListele(tenantId).catch(() => []);
  const stokAlt = stokAltlari(tenant.settings);

  const adaylar = tarama.haberler.filter((h) => emekliKonusuMu(h.baslik, h.govde));
  const eslesen = new Set(adaylar.map((h) => h.link));
  // Anahtar kelimeye uymayanlar bir daha indirilmesin.
  for (const link of tarama.okunanlar) if (!eslesen.has(link)) hafiza.add(link);

  const claudeVar = Boolean(process.env.ANTHROPIC_API_KEY);
  const slugs = kategoriler.map((c) => c.slug);
  const sonuc: HatSonucu = {
    mod: claudeVar ? "claude" : "ham",
    taslaklar: [],
    elenen: 0,
    hatalar: [],
    mesaj: "",
  };

  /** Claude yoksa ham metinden aynı taslak alanlarını üretir. */
  const hazirla = async (haber: CekilenHaber) => {
    if (!claudeVar) {
      return {
        uygun: true,
        baslik: haber.baslik,
        slug: haberSlug(haber),
        kapakBasligi: kapakIcinKisalt(haber.baslik),
        ozet: otomatikOzet(haber.govde),
        html: govdeToHtml(haber),
        kategori: kategoriTahmin(haber.baslik, haber.govde, slugs),
        // Boşsa site haber başlığını kullanır.
        metaBaslik: null,
        metaAciklama: otomatikOzet(haber.govde, 155),
      };
    }
    const yazi = await haberiYenidenYaz(haber, slugs);
    return {
      uygun: yazi.uygun,
      baslik: yazi.baslik,
      slug: slugify(yazi.baslik),
      kapakBasligi: yazi.kapakBasligi,
      ozet: yazi.ozet,
      html: yenidenYazilmisHtml(yazi),
      kategori: yazi.kategori,
      metaBaslik: yazi.metaBaslik,
      metaAciklama: yazi.metaAciklama,
    };
  };

  const isle = async (haber: (typeof adaylar)[number]) => {
    try {
      const yazi = await hazirla(haber);
      if (!yazi.uygun) {
        sonuc.elenen += 1;
        hafiza.add(haber.link);
        return;
      }
      const kategori = kategoriler.find((c) => c.slug === yazi.kategori);
      const slug = yazi.slug;
      const stok = stokSec(stoklar, yazi.kategori, sonStoklar);
      const foto = stok ? await stokVeri(stok.path).catch(() => null) : null;
      const png = await kapakUret(yazi.kapakBasligi, kategori?.name ?? "Emekli Haberleri", foto);
      const coverUrl = await kapakYukle(tenantId, slug, png);

      const taslak = await createArticle(tenantId, {
        title: yazi.baslik,
        slug,
        excerpt: yazi.ozet,
        content_html: yazi.html,
        cover_url: coverUrl,
        // Fotoğraflı kapakta panelde yazılan tarif; kırmızı kapakta görseldeki başlık.
        cover_alt: stok ? (stokAlt[stok.path] ?? `${kategori?.name ?? "Emekli"} haberi için temsili fotoğraf`) : yazi.kapakBasligi,
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

  await ayarlariGuncelle(tenantId, (taze) => {
    taze[AYAR_ANAHTARI] = {
      islenenler: [...hafiza].slice(-HAFIZA),
      sonStoklar: sonStoklar.slice(-STOK_TEKRAR),
      sonCalisma: new Date().toISOString(),
    };
  });

  sonuc.mesaj = `[${sonuc.mod}] ${tarama.tarandi} sayfa okundu, ${adaylar.length} emekli haberi, ${sonuc.taslaklar.length} taslak, ${sonuc.elenen} elendi, ${sonuc.hatalar.length} hata.`;
  return sonuc;
}
