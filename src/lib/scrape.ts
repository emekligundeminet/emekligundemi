import Parser from "rss-parser";
import * as cheerio from "cheerio";
import type { CekilenHaber, TaramaSonucu } from "@/types/cekilen";
import { keywordsToRegex, type ScrapeConfig } from "@/lib/scrape-config";

export type { CekilenHaber, TaramaSonucu };

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

const parser = new Parser();

function eslesiyor(baslik: string, govde: string, include: RegExp | null, exclude: RegExp | null) {
  const metin = `${baslik} ${govde}`;
  if (include && !include.test(metin)) return false;
  if (exclude && exclude.test(metin)) return false;
  return true;
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

export async function tara(config: ScrapeConfig): Promise<TaramaSonucu> {
  const gorulen = new Set<string>();
  const sonuclar: CekilenHaber[] = [];
  let tarandi = 0;
  const include = keywordsToRegex(config.include);
  const exclude = keywordsToRegex(config.exclude);

  for (const feed of config.feeds) {
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

        if (!eslesiyor(item.title ?? "", govde, include, exclude)) continue;

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
