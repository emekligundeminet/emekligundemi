import type { CheerioAPI } from "cheerio";
import type { AnyNode, Text } from "domhandler";

/**
 * Otomatik iç link: haber metninde geçen kalıp ifadeleri ilgili araç,
 * rehber veya kategori sayfasına bağlar. Yapay zeka yok, kelime tablosu.
 *
 * Kurallar:
 * - Her hedefe en fazla 1 link, haber başına en fazla İC_LINK_MAX link.
 * - Yalnız paragraf/listede; başlık, mevcut link ve tablo başlığına dokunmaz.
 * - Sayfa kendine ve metinde zaten linklenmiş hedefe link vermez.
 * - Sıra önemli: özel ifade genelden önce gelir.
 *
 * Yeni kural: tabloya satır ekleyin. `desen` kelimenin başından eşleşir;
 * Türkçe ekleri (`\p{L}*`) kalıbın sonuna yazın ki "ikramiyesini" bütün bağlansın.
 */
export const IC_LINK_MAX = 3;

type IcLinkKurali = { desen: RegExp; hedef: string; baslik: string };

const EK = String.raw`\p{L}*`;
const kalip = (govde: string) =>
  new RegExp(String.raw`(?<![\p{L}\p{N}])(?:${govde})`, "iu");

export const IC_LINK_KURALLARI: IcLinkKurali[] = [
  {
    desen: kalip(String.raw`emekli (?:maaşı|aylığı) hesapla${EK}`),
    hedef: "/araclar/emekli-maasi-hesaplama",
    baslik: "Emekli maaşı hesaplama",
  },
  {
    desen: kalip(String.raw`maaşına haciz${EK}|emekli maaşı(?:na)? haciz${EK}`),
    hedef: "/blog/emekli-maasina-haciz-gelir-mi-hangi-durumlarda-kesinti-yapilir",
    baslik: "Emekli maaşına haciz gelir mi?",
  },
  {
    desen: kalip(String.raw`bayram ikramiye${EK}`),
    hedef: "/araclar/emekli-bayram-ikramiyesi",
    baslik: "Bayram ikramiyesi hesaplama",
  },
  {
    desen: kalip(String.raw`alım gücü${EK}`),
    hedef: "/araclar/alim-gucu-kaybi",
    baslik: "Alım gücü kaybı hesaplama",
  },
  {
    desen: kalip(String.raw`emekli zam oran${EK}|emekli zamm${EK}|emekliye (?:ocak|temmuz) zamm${EK}`),
    hedef: "/araclar/emekli-zam-hesaplama",
    baslik: "Emekli zam hesaplama",
  },
  {
    desen: kalip(String.raw`en düşük emekli (?:maaşı|aylığı)${EK}`),
    hedef: "/kategori/emekli-maasi",
    baslik: "Emekli maaşı haberleri",
  },
  {
    desen: kalip(String.raw`emekli promosyon${EK}|banka promosyon${EK}|promosyon (?:tutar|kampanya)${EK}`),
    hedef: "/kategori/promosyon",
    baslik: "Emekli promosyonu haberleri",
  },
];

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

/** prepareArticleHtml'in açtığı cheerio belgesine iç linkleri ekler. */
export function icLinkleriEkle($: CheerioAPI, mevcutYol: string, max = IC_LINK_MAX) {
  const linkli = new Set(
    $("a[href]")
      .map((_, a) => ($(a).attr("href") ?? "").replace(/^https?:\/\/[^/]+/, "").split(/[?#]/)[0])
      .get()
  );
  let eklenen = 0;
  for (const kural of IC_LINK_KURALLARI) {
    if (eklenen >= max) break;
    if (kural.hedef === mevcutYol || linkli.has(kural.hedef)) continue;
    for (const dugum of metinDugumleri($)) {
      const m = kural.desen.exec(dugum.data);
      if (!m) continue;
      const once = dugum.data.slice(0, m.index);
      const sonra = dugum.data.slice(m.index + m[0].length);
      $(dugum).replaceWith(
        `${kacis(once)}<a href="${kural.hedef}" title="${kacis(kural.baslik)}">${kacis(m[0])}</a>${kacis(sonra)}`
      );
      linkli.add(kural.hedef);
      eklenen += 1;
      break;
    }
  }
  return eklenen;
}
