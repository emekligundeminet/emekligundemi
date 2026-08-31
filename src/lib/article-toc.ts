import type { CheerioAPI } from "cheerio";
import { slugify } from "@/lib/slugify";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

const MIN_TOC = 2;

function uniqueId(base: string, used: Set<string>): string {
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

/** Başlıklara id basar; içindekiler için düz liste döner. */
export function stampHeadingIds($: CheerioAPI): TocItem[] {
  const used = new Set<string>();
  const items: TocItem[] = [];

  $("h2, h3").each((_, el) => {
    const node = $(el);
    const text = node.text().replace(/\s+/g, " ").trim();
    if (!text) return;
    const existing = node.attr("id")?.trim();
    const base = existing || `b-${slugify(text)}`;
    const id = uniqueId(base, used);
    node.attr("id", id);
    const tag = el.tagName.toLowerCase();
    items.push({ id, text, level: tag === "h3" ? 3 : 2 });
  });

  return items;
}

/** İki H2 varsa yalnız onlar; yoksa H2+H3. Tek başlıkta kutu yok. */
export function pickTocItems(items: TocItem[]): TocItem[] {
  const h2 = items.filter((item) => item.level === 2);
  if (h2.length >= MIN_TOC) return h2;
  return items.length >= MIN_TOC ? items : [];
}
