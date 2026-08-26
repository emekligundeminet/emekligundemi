import Parser from "rss-parser";
import * as cheerio from "cheerio";

export type CekilenHaber = {
  id: string;
  kaynak: string;
  baslik: string;
  tarih: string;
  link: string;
  govde: string;
};

export type TaramaSonucu = {
  haberler: CekilenHaber[];
  tarandi: number;
  mesaj: string;
};

const FEEDS = [
  { name: "Sözcü Son Dakika", url: "https://www.sozcu.com.tr/feeds-son-dakika" },
  { name: "Sözcü Haberler", url: "https://www.sozcu.com.tr/feeds-haberler" },
];

const OLUMLU =
  /emekli|SGK|EYT|intibak|prim gün|maaş bağla|aylık bağla|yaşlılık aylığı|BAĞ-?KUR|zam/i;
const NEGATIF = /emekli oldu|futbol|teknik direktör|transfer|hayatını kaybet/i;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const parser = new Parser();

function eslesiyor(baslik: string, govde: string) {
  const metin = `${baslik} ${govde}`;
  return OLUMLU.test(metin) && !NEGATIF.test(metin);
}

async function govdeCek(url: string) {
  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const el = $("[property='articleBody'], .article-body").first();
  const parcalar: string[] = [];
  el.find("p, h2, h3").each((_, node) => {
    const t = $(node).text().replace(/\s+/g, " ").trim();
    if (t) parcalar.push(t);
  });
  return parcalar.join("\n\n") || el.text().replace(/\s+/g, " ").trim();
}

export async function tara(): Promise<TaramaSonucu> {
  const gorulen = new Set<string>();
  const sonuclar: CekilenHaber[] = [];
  let tarandi = 0;

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items ?? [];
      console.log(`[OK] ${feed.name}: RSS'ten ${items.length} haber`);

      for (const item of items) {
        const link = item.link ?? "";
        if (!link || gorulen.has(link)) continue;
        gorulen.add(link);

        let govde = "";
        try {
          govde = await govdeCek(link);
          tarandi += 1;
        } catch (err) {
          const msg = err instanceof Error ? err.message : "bilinmeyen hata";
          console.error(`[HATA] Gövde alınamadı (${link}): ${msg}`);
          continue;
        }

        if (!eslesiyor(item.title ?? "", govde)) continue;

        sonuclar.push({
          id: link,
          kaynak: feed.name,
          baslik: item.title ?? "(başlık yok)",
          tarih: item.pubDate ?? item.isoDate ?? "-",
          link,
          govde,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "bilinmeyen hata";
      console.error(`[HATA] ${feed.name} (${feed.url}): ${msg}`);
    }
  }

  console.log(`Toplam ${sonuclar.length} haber bulundu.`);
  return {
    haberler: sonuclar,
    tarandi,
    mesaj: `${tarandi} haber sayfası okundu, ${sonuclar.length} eşleşme.`,
  };
}
