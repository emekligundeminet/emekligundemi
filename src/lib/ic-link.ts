import type { CheerioAPI } from "cheerio";
import type { AnyNode, Text } from "domhandler";

/**
 * Otomatik iç link (WordPress "Internal Link Juicer" benzeri).
 * Kurallar panelden (Site → İç linkler) yönetilir, tenant ayarlarında
 * `icLinkler` olarak durur; hiç kaydedilmemişse VARSAYILAN_IC_LINKLER kullanılır.
 *
 * - Her anahtar kelime sayfada yalnız İLK geçtiği yerde linklenir.
 * - Aynı hedefe sayfada tek link; sayfa başına en fazla `max` link.
 * - Yalnız paragraf/listede; başlık, mevcut link ve sayfanın kendisi atlanır.
 * - Uzun ifade önce denenir ("en düşük emekli maaşı" > "emekli maaşı").
 * - Kayıtlı içerik değişmez; link gösterim anında eklenir.
 */

export type IcLinkKaydi = {
  id: string;
  /** Virgülle ayrılmış ifadeler: "emekli zammı, emekli zam oranı" */
  kelimeler: string;
  /** Site içi yol: "/araclar/emekli-zam-hesaplama" */
  hedef: string;
  /** true: Türkçe ekleri de kapsar ("ikramiyesi" → "ikramiyesini"). */
  ekler: boolean;
  aktif: boolean;
};

export type IcLinkAyari = { kayitlar: IcLinkKaydi[]; max: number };

export const IC_LINK_MAX = 5;

export const VARSAYILAN_IC_LINKLER: IcLinkKaydi[] = [
  { id: "maas-hesap", kelimeler: "emekli maaşı hesaplama, emekli aylığı hesaplama", hedef: "/araclar/emekli-maasi-hesaplama", ekler: true, aktif: true },
  { id: "haciz", kelimeler: "emekli maaşına haciz, maaşına haciz", hedef: "/blog/emekli-maasina-haciz-gelir-mi-hangi-durumlarda-kesinti-yapilir", ekler: true, aktif: true },
  { id: "ikramiye", kelimeler: "bayram ikramiyesi", hedef: "/araclar/emekli-bayram-ikramiyesi", ekler: true, aktif: true },
  { id: "alim-gucu", kelimeler: "alım gücü", hedef: "/araclar/alim-gucu-kaybi", ekler: true, aktif: true },
  { id: "emeklilik-tarihi", kelimeler: "ne zaman emekli olurum, emeklilik tarihi, emeklilik yaşı", hedef: "/araclar/ne-zaman-emekli-olurum", ekler: true, aktif: true },
  { id: "zam", kelimeler: "emekli zammı, emekli zam oranı, emekliye ocak zammı, emekliye temmuz zammı", hedef: "/araclar/emekli-zam-hesaplama", ekler: true, aktif: true },
  { id: "en-dusuk", kelimeler: "en düşük emekli maaşı, en düşük emekli aylığı", hedef: "/kategori/emekli-maasi", ekler: true, aktif: true },
  { id: "promosyon", kelimeler: "emekli promosyonu, banka promosyonu", hedef: "/kategori/promosyon", ekler: true, aktif: true },
];

function hedefNormal(hedef: string) {
  const t = hedef.trim().replace(/^https?:\/\/[^/]+/i, "").split(/[?#]/)[0];
  if (!t.startsWith("/")) return null;
  return t.length > 1 ? t.replace(/\/+$/, "") : t;
}

/** Ayarlardan güvenli kayıt listesi; kayıt yoksa varsayılanlar. */
export function icLinkAyarlari(settings: unknown): IcLinkAyari {
  const rec = settings && typeof settings === "object" && !Array.isArray(settings) ? (settings as Record<string, unknown>) : {};
  const ham = rec.icLinkler;
  const maxHam = Number(rec.icLinkMax);
  const max = Number.isFinite(maxHam) && maxHam >= 1 && maxHam <= 20 ? Math.round(maxHam) : IC_LINK_MAX;
  if (!Array.isArray(ham)) return { kayitlar: VARSAYILAN_IC_LINKLER, max };
  const kayitlar: IcLinkKaydi[] = [];
  for (const r of ham) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const kelimeler = typeof o.kelimeler === "string" ? o.kelimeler.slice(0, 500) : "";
    const hedef = typeof o.hedef === "string" ? hedefNormal(o.hedef) : null;
    if (!kelimeler.trim() || !hedef) continue;
    kayitlar.push({
      id: typeof o.id === "string" && o.id ? o.id.slice(0, 40) : Math.random().toString(36).slice(2, 10),
      kelimeler,
      hedef,
      ekler: o.ekler !== false,
      aktif: o.aktif !== false,
    });
  }
  return { kayitlar: kayitlar.slice(0, 300), max };
}

const TR: Record<string, string> = { i: "[iİ]", "İ": "[iİ]", ı: "[ıI]", I: "[ıI]" };
const kacisRegex = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "emekli zammı" → Türkçe büyük/küçük harf duyarsız, kelime başından eşleşen desen. */
export function kelimeDeseni(kelime: string, ekler: boolean) {
  const govde = [...kelime.trim().replace(/\s+/g, " ")]
    .map((c) => (c === " " ? String.raw`\s+` : (TR[c] ?? kacisRegex(c))))
    .join("");
  const son = ekler ? String.raw`\p{L}*` : String.raw`(?![\p{L}\p{N}])`;
  return new RegExp(String.raw`(?<![\p{L}\p{N}])${govde}${son}`, "iu");
}

type Derlenmis = { desen: RegExp; hedef: string; uzunluk: number };

function derle(kayitlar: IcLinkKaydi[]): Derlenmis[] {
  const out: Derlenmis[] = [];
  for (const k of kayitlar) {
    if (!k.aktif) continue;
    for (const kelime of k.kelimeler.split(",").map((x) => x.trim()).filter(Boolean)) {
      out.push({ desen: kelimeDeseni(kelime, k.ekler), hedef: k.hedef, uzunluk: kelime.length });
    }
  }
  return out.sort((a, b) => b.uzunluk - a.uzunluk);
}

const KAPSAM = "p, li";
const YASAK_ATA = "a, h1, h2, h3, h4, h5, h6, th, figcaption, button";

function kacis(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function metinDugumleri($: CheerioAPI): Text[] {
  const out: Text[] = [];
  const gez = (node: AnyNode) => {
    if (node.type === "text") out.push(node as Text);
    else if ("children" in node) for (const c of node.children) gez(c);
  };
  $(KAPSAM).each((_, el) => {
    if ($(el).closest(YASAK_ATA).length || $(el).parents(KAPSAM).length) return;
    for (const c of el.children) gez(c);
  });
  return out.filter((t) => !$(t).parents(YASAK_ATA).length);
}

/** prepareArticleHtml'in açtığı cheerio belgesine iç linkleri ekler; eklenen sayıyı döner. */
export function icLinkleriEkle(
  $: CheerioAPI,
  mevcutYol: string,
  ayar: IcLinkAyari = { kayitlar: VARSAYILAN_IC_LINKLER, max: IC_LINK_MAX }
) {
  const linkli = new Set(
    $("a[href]")
      .map((_, a) => hedefNormal($(a).attr("href") ?? "") ?? "")
      .get()
  );
  const kendisi = hedefNormal(mevcutYol);
  let eklenen = 0;
  for (const kural of derle(ayar.kayitlar)) {
    if (eklenen >= ayar.max) break;
    if (kural.hedef === kendisi || linkli.has(kural.hedef)) continue;
    for (const dugum of metinDugumleri($)) {
      const m = kural.desen.exec(dugum.data);
      if (!m) continue;
      const once = dugum.data.slice(0, m.index);
      const sonra = dugum.data.slice(m.index + m[0].length);
      $(dugum).replaceWith(`${kacis(once)}<a href="${kacis(kural.hedef)}">${kacis(m[0])}</a>${kacis(sonra)}`);
      linkli.add(kural.hedef);
      eklenen += 1;
      break;
    }
  }
  return eklenen;
}
