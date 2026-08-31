import type { Metadata } from "next";
import { SITE_ORIGIN } from "@/lib/site";

/** Google Keşfet büyük kart: max-image-preview:large şart. */
const GOOGLE_PREVIEW = {
  "max-image-preview": "large" as const,
  "max-snippet": -1,
  "max-video-preview": -1,
};

export const INDEX_ROBOTS = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, ...GOOGLE_PREVIEW },
} satisfies Metadata["robots"];

export const NOINDEX_FOLLOW_ROBOTS = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true, ...GOOGLE_PREVIEW },
} satisfies Metadata["robots"];

export const OG_LOCALE = "tr_TR";

export function toIso8601(raw: string): string {
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? raw : d.toISOString();
}

export function wordCountFromHtml(html: string): number {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(" ").length;
}

export function rssAlternate(origin = SITE_ORIGIN): NonNullable<Metadata["alternates"]>["types"] {
  return { "application/rss+xml": `${origin.replace(/\/$/, "")}/rss.xml` };
}

export function coverSizeFromUrl(url: string): { width?: number; height?: number } {
  try {
    const w = Number(new URL(url).searchParams.get("w"));
    const h = Number(new URL(url).searchParams.get("h"));
    return {
      width: Number.isFinite(w) && w >= 1 ? Math.round(w) : undefined,
      height: Number.isFinite(h) && h >= 1 ? Math.round(h) : undefined,
    };
  } catch {
    return {};
  }
}

export function ogCoverImage(url: string, alt: string) {
  const size = coverSizeFromUrl(url);
  return { url, alt, ...size };
}

/**
 * Sitemap için kapak URL'i: ?w=&h= atılır. Next'in sitemap serializer'ı
 * image:loc içindeki & karakterini escape etmediği için ham & XML'i kırıyor.
 */
export function sitemapImageUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    parsed.search = "";
    parsed.hash = "";
    const clean = parsed.toString();
    return /[<>&"']/.test(clean) ? null : clean;
  } catch {
    return null;
  }
}

export function articleSocialMeta(opts: {
  title: string;
  description?: string;
  canonical: string;
  siteName: string;
  publishedAt: string;
  modifiedTime: string;
  ogImage: string | null;
  ogAlt?: string;
  authors?: string[];
  section?: string;
}): Metadata {
  const images = opts.ogImage ? [ogCoverImage(opts.ogImage, opts.ogAlt || opts.title)] : undefined;
  return {
    robots: INDEX_ROBOTS,
    alternates: { canonical: opts.canonical },
    openGraph: {
      type: "article",
      locale: OG_LOCALE,
      siteName: opts.siteName,
      title: opts.title,
      description: opts.description,
      url: opts.canonical,
      publishedTime: opts.publishedAt,
      modifiedTime: opts.modifiedTime,
      authors: opts.authors,
      section: opts.section,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: opts.ogImage ? [opts.ogImage] : undefined,
    },
  };
}
