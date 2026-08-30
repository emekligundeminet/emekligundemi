import { jsonLdSchemaType } from "@/lib/content-type";

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
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: clipHeadline(opts.title),
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt,
    image: opts.coverAbs ? [opts.coverAbs] : undefined,
    description: opts.excerpt || undefined,
    mainEntityOfPage: opts.canonical,
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
      logo: { "@type": "ImageObject", url: opts.logoUrl },
    },
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
