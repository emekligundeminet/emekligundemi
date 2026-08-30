import { articlePath } from "@/lib/content-type";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

/** Tenant settings boşsa getSiteMeta() buraya düşer. Metadata/JSON-LD doğrudan bunları kullanmaz. */
export const SITE_NAME = "Emekliler";
/** Sekme / <title> soneki. Haber detayında kullanılmaz. */
export const TITLE_SUFFIX = "Emekliler.org";
export const HOME_TITLE = "Emekli Haberleri";

/** Editör/panel soneki varsa düşür; şablon bir kez `| Emekliler.org` ekler. */
export function stripBrandTitle(raw: string) {
  return raw.replace(/\s*[|—–-]\s*Emekliler(?:\.org)?\s*$/i, "").trim();
}

/** Statik sayfa / kategori sekme başlığı. Haber detayında kullanma. */
export function staticDocumentTitle(pageName: string) {
  const clean = stripBrandTitle(pageName);
  return clean ? `${clean} | ${TITLE_SUFFIX}` : TITLE_SUFFIX;
}
export const SITE_TAGLINE =
  "Emekliler için güncel emekli maaşı, zam, SGK ve promosyon haberleri.";
/** primary_color yokken --brand. Tek yedek; UI'da başka marka hex yok. */
export const BRAND_FALLBACK = "#F71515";

/** public kök — /images/... eski kategori 308’ine takılmasın. */
export const BRAND_LOGO = {
  color: "/logo-color.svg",
  white: "/logo-white.svg",
  onRed: "/logo-on-red.svg",
  favicon: "/favicon.svg",
} as const;

export const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://emekliler.org"
).replace(/\/$/, "");

export { BLOG_INDEX_PATH, articlePath } from "@/lib/content-type";
export const BLOG_INDEX_TITLE = "Emekli Rehberi";
export const PENSION_TOOL_PATH = "/arac/emekli-maasi-hesaplama";

export function articleCanonicalUrl(article: { slug: string; type?: string | null }) {
  return `${SITE_ORIGIN}${articlePath(article)}`;
}

export const CATEGORY_NAV_ORDER = [
  "gundem",
  "emekli-maasi",
  "zam",
  "sgk",
  "promosyon",
  "ikramiye-ve-odemeler",
  "emekli-yasam",
  "eyt",
  "intibak",
  "3600-ek-gosterge",
  "bagkur",
  "prim-gun",
  "emeklilik-yasi",
  "bayram-ikramiyesi",
  "promosyon",
  "dul-yetim",
  "kamu-emeklisi",
  "mevzuat",
  "saglik",
  "ekonomi",
];

export function formatToday() {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export function formatNewsDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatNewsDateTime(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function excerptFromHtml(html: string, max = 160) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

/** Sayfa adı; `| Emekliler` soneki varsa temizlenir. */
export function categoryMetaTitle(kat: { name: string; meta_title?: string | null }) {
  const custom = kat.meta_title?.trim();
  return stripBrandTitle(custom || `${kat.name} Haberleri`);
}

/** Kategori H1: gündem/emekli-yaşam olduğu gibi; ikramiye özel; diğerleri + Haberleri. */
export function categoryPageHeading(slug: string, name: string) {
  if (slug === "ikramiye-ve-odemeler") return "Emekli İkramiye ve Ödemeler";
  if (slug === "gundem" || slug === "emekli-yasam") return name;
  const trimmed = name.trim();
  if (trimmed.toLocaleLowerCase("tr").endsWith("haberleri")) return trimmed;
  return `${trimmed} Haberleri`;
}

export function categoryMetaDescription(kat: {
  name: string;
  meta_description?: string | null;
}) {
  const custom = kat.meta_description?.trim();
  return custom || `${kat.name} haberleri.`;
}

export function categoryName(
  article: Article,
  categories: Category[]
): string {
  if (article.category_name) return article.category_name;
  if (article.category_id) {
    return categories.find((c) => c.id === article.category_id)?.name ?? "Gündem";
  }
  return "Gündem";
}

export function categorySlugOf(article: Article, categories: Category[]) {
  if (article.category_slug) return article.category_slug;
  if (article.category_id) {
    return categories.find((c) => c.id === article.category_id)?.slug ?? "";
  }
  return "";
}

export type ArticleCard = {
  id: string;
  title: string;
  slug: string;
  href: string;
  excerpt: string;
  image: string | null;
  alt: string;
  published_at: string;
};

export function toArticleCard(article: Article): ArticleCard {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    href: articlePath(article),
    excerpt: excerptFromHtml(article.excerpt || article.content_html || "", 150),
    image: article.cover_url,
    alt: article.cover_alt || article.title,
    published_at: article.published_at || article.updated_at,
  };
}
