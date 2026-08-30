import * as cheerio from "cheerio";

const FALLBACK_W = 16;
const FALLBACK_H = 9;

function positiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Public render: boyutsuz <img> için oran kilidi + lazy.
 * src/anlam değişmez; yalnız eksik attribute eklenir.
 */
export function prepareArticleHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return html;

  const $ = cheerio.load(trimmed, undefined, false);

  // Gövde tek H1 kuralı: içerikteki h1 → h2; mevcut h2/h3 dokunulmaz.
  $("h1").each((_, el) => {
    el.tagName = "h2";
  });

  $("img").each((_, el) => {
    const img = $(el);
    if (!img.attr("src")?.trim()) return;

    const w = positiveInt(img.attr("width"));
    const h = positiveInt(img.attr("height"));
    if (w === null || h === null) {
      img.attr("width", String(FALLBACK_W));
      img.attr("height", String(FALLBACK_H));
    }

    if (img.attr("loading") !== "eager") {
      img.attr("loading", "lazy");
    }
    img.attr("decoding", "async");

    const style = img.attr("style") ?? "";
    if (!/aspect-ratio\s*:/i.test(style)) {
      const aw = img.attr("width");
      const ah = img.attr("height");
      const bit = `aspect-ratio:${aw} / ${ah}`;
      img.attr("style", style.trim() ? `${style.trim().replace(/;?\s*$/, ";")}${bit}` : bit);
    }
  });

  return $.html();
}
