import { slugify } from "@/lib/slugify";

/** Tek karar kaynağı. Kategori slug'ına bakılmaz. */
export type ContentType = "news" | "guide";

export const BLOG_INDEX_PATH = "/blog";

export function parseContentType(value: unknown): ContentType {
  return value === "guide" ? "guide" : "news";
}

export function isGuide(type: string | null | undefined): boolean {
  return type === "guide";
}

/** type='guide' → /blog/{slug} ; type='news' → /{slug} */
export function articlePath(article: { slug: string; type?: string | null }): string {
  const slug = article.slug.replace(/^\/+|\/+$/g, "");
  return isGuide(article.type) ? `${BLOG_INDEX_PATH}/${slug}` : `/${slug}`;
}

export function jsonLdSchemaType(type: string | null | undefined): "Article" | "NewsArticle" {
  return isGuide(type) ? "Article" : "NewsArticle";
}

/** Google News: yalnızca type='news'. Guide asla geçmez. */
export function filterNewsSitemap<T extends { type?: string | null }>(rows: T[]): T[] {
  return rows.filter((row) => row.type === "news");
}

/**
 * /blog ile çakışan kategori slug'ı (konu adı). İçerik tipi değil;
 * /kategori/blog → /blog yönü için.
 */
export function isReservedBlogIndexSlug(slug: string | null | undefined): boolean {
  return slug === "blog" || slug === "rehber";
}

/** Root slug üretiminde yasaklı ilk segment. */
export const RESERVED_CONTENT_SLUGS = new Set([
  "admin",
  "api",
  "blog",
  "arac",
  "araclar",
  "hesaplama",
  "emekli-maasi-hesaplama",
  "kategori",
  "haber",
  "iletisim",
  "kunye",
  "reklam",
  "kvkk",
  "aydinlatma-metni",
  "cerez-politikasi",
  "gizlilik",
  "yasal",
  "kvkk-saklama-imha",
  "fonts",
  "yazar",
  "yazarlar",
  "ara",
  "arsiv",
  "hakkimizda",
  "yayin-ilkeleri",
  "duzeltme",
  "rss",
  "feed",
  "sitemap",
  "news-sitemap",
  "robots",
  "preview",
  "login",
  "settings",
  "sources",
  "t",
]);

export function uniquifySlug(
  desired: string,
  taken: Iterable<string>,
  reserved: Set<string> = RESERVED_CONTENT_SLUGS
): string {
  const root = slugify(desired) || "haber";
  const takenSet = taken instanceof Set ? taken : new Set(taken);
  const isTaken = (candidate: string) => reserved.has(candidate) || takenSet.has(candidate);
  if (!isTaken(root)) return root;
  let n = 2;
  while (isTaken(`${root}-${n}`)) {
    n += 1;
    if (n > 500) return `${root}-${Date.now()}`;
  }
  return `${root}-${n}`;
}
