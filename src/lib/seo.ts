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

export function rssAlternate(origin = SITE_ORIGIN): NonNullable<Metadata["alternates"]>["types"] {
  return { "application/rss+xml": `${origin.replace(/\/$/, "")}/rss.xml` };
}

export function ogCoverImage(url: string, alt: string) {
  return { url, alt, width: 1200, height: 675 };
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
