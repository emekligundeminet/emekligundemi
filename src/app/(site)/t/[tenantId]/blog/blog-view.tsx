import { CategoryFeed } from "@/components/category-feed";
import { BLOG_INDEX_TITLE, BRAND_LOGO, TITLE_SUFFIX, staticDocumentTitle, toArticleCard } from "@/lib/site";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { cachedBlogArticles, cachedSiteMeta } from "@/lib/cached-public";
import { NOINDEX_FOLLOW_ROBOTS } from "@/lib/seo";
import { feedPagePath } from "@/lib/feed-page";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Args = { tenantId: string; page: number };

export async function blogIndexMetadata({ tenantId, page }: Args): Promise<Metadata> {
  const site = await cachedSiteMeta(tenantId);
  const description = "Emeklilik rehberi ve kalıcı yazılar.";
  const canonicalPath = feedPagePath("/blog", page);
  const canonical = site ? `${site.origin}${canonicalPath}` : canonicalPath;
  return {
    title: { absolute: staticDocumentTitle(BLOG_INDEX_TITLE) },
    description,
    alternates: { canonical },
    robots: page > 1 ? NOINDEX_FOLLOW_ROBOTS : undefined,
    openGraph: {
      type: "website",
      siteName: TITLE_SUFFIX,
      title: BLOG_INDEX_TITLE,
      description,
      url: canonical,
      images: [{ url: BRAND_LOGO.onRed, alt: TITLE_SUFFIX }],
    },
  };
}

export async function BlogIndexView({ tenantId, page }: Args) {
  if (!tenantId) notFound();
  const [site, feed] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId, page),
  ]);
  const { articles, total, pageSize } = feed;
  const cards = articles.map(toArticleCard);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {site ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(
              breadcrumbJsonLd(site.origin, [
                { name: "Emekli Haberleri", path: "/" },
                { name: BLOG_INDEX_TITLE, path: "/blog" },
              ])
            ),
          }}
        />
      ) : null}
      <CategoryFeed
        name={BLOG_INDEX_TITLE}
        slug="blog"
        description="Emeklilik rehberi ve kalıcı yazılar."
        featured={page === 1 ? cards.slice(0, 1) : []}
        initialMore={page === 1 ? cards.slice(1) : cards}
        total={total}
        page={page}
        pageSize={pageSize}
        logoSrc={site?.logoUrl}
      />
    </div>
  );
}
