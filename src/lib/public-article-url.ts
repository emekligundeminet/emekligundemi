import { jsonLdSchemaType } from "@/lib/content-type";
import { publisherLogoUrl } from "@/lib/publisher";
import { SITE_ORIGIN } from "@/lib/site";
import { toIso8601 } from "@/lib/seo";

function originOf(canonical: string) {
  try {
    return new URL(canonical).origin;
  } catch {
    return SITE_ORIGIN;
  }
}

/**
 * Public haber yolu: /{slug}. İç ISR yolu /t/{tenantId} asla üretilmez.
 */
export function publicArticlePath(slug: string): string | null {
  const clean = slug.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  if (!clean || clean.includes("/") || clean === "t") return null;
  return `/${clean}`;
}

export function publicArticleUrl(origin: string, slug: string): string | null {
  const path = publicArticlePath(slug);
  if (!path) return null;
  return `${origin.replace(/\/$/, "")}${path}`;
}

export function clipHeadline(text: string, max = 110) {
  const t = text.trim();
  if (t.length <= max) return t;
  const sliced = t.slice(0, max);
  const sp = sliced.lastIndexOf(" ");
  return (sp > 80 ? sliced.slice(0, sp) : sliced).replace(/[.,;:–—-]+$/, "").trimEnd();
}

export function documentTitleFor(article: { meta_title: string | null; title: string }) {
  return (article.meta_title || article.title).trim();
}

export function articleJsonLdByType(
  type: string | null | undefined,
  opts: Parameters<typeof newsArticleJsonLd>[0]
) {
  return {
    ...newsArticleJsonLd(opts),
    "@type": jsonLdSchemaType(type),
  };
}

export function newsArticleJsonLd(opts: {
  title: string;
  publishedAt: string;
  updatedAt: string;
  excerpt: string | null;
  coverAbs: string | null;
  canonical: string;
  siteName: string;
  logoUrl: string;
  authorName: string | null;
  authorUrl?: string | null;
  section?: string | null;
  wordCount?: number;
}) {
  const logo = publisherLogoUrl(originOf(opts.canonical));
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: clipHeadline(opts.title),
    inLanguage: "tr-TR",
    isAccessibleForFree: true,
    datePublished: toIso8601(opts.publishedAt),
    dateModified: toIso8601(opts.updatedAt),
    articleSection: opts.section || undefined,
    wordCount: opts.wordCount && opts.wordCount > 0 ? opts.wordCount : undefined,
    image: opts.coverAbs
      ? [
          {
            "@type": "ImageObject",
            url: opts.coverAbs,
            width: 1200,
            height: 675,
          },
        ]
      : undefined,
    description: opts.excerpt || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": opts.canonical },
    author: opts.authorName
      ? {
          "@type": "Person",
          name: opts.authorName,
          url: opts.authorUrl || undefined,
        }
      : { "@type": "Organization", name: opts.siteName },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: opts.siteName,
      logo: { "@type": "ImageObject", url: logo, width: 600, height: 160 },
    },
    copyrightHolder: { "@type": "NewsMediaOrganization", name: opts.siteName },
    spatialCoverage: { "@type": "Country", name: "TR" },
  };
}

/** Evergreen rehber — haber değil. dateModified güncellemede şart. */
export function evergreenArticleJsonLd(opts: {
  title: string;
  publishedAt: string;
  updatedAt: string;
  excerpt: string | null;
  coverAbs: string | null;
  canonical: string;
  siteName: string;
  logoUrl: string;
  authorName: string | null;
}) {
  return {
    ...newsArticleJsonLd(opts),
    "@type": "Article",
  };
}
