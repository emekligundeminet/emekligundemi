import { CategoryFeed } from "@/components/category-feed";
import { BLOG_INDEX_TITLE, BRAND_LOGO, SITE_NAME, toArticleCard } from "@/lib/site";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { cachedBlogArticles, cachedSiteMeta } from "@/lib/cached-public";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { tenantId: string };

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ sayfa?: string }>;
}): Promise<Metadata> {
  const { tenantId } = await params;
  const { sayfa } = await searchParams;
  const page = Math.max(1, Number(sayfa) || 1);
  const site = await cachedSiteMeta(tenantId);
  const siteName = site?.name ?? SITE_NAME;
  const description = site
    ? `${siteName} emeklilik rehberi ve kalıcı yazılar.`
    : "Emeklilik rehberi yazıları";
  const canonical = site
    ? `${site.origin}/blog${page > 1 ? `?sayfa=${page}` : ""}`
    : "/blog";
  return {
    title: BLOG_INDEX_TITLE,
    description,
    alternates: { canonical },
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName,
      title: BLOG_INDEX_TITLE,
      description,
      url: canonical,
      images: [{ url: BRAND_LOGO.onRed, alt: siteName }],
    },
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ sayfa?: string }>;
}) {
  const { tenantId } = await params;
  const { sayfa } = await searchParams;
  const page = Math.max(1, Number(sayfa) || 1);
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
        description={site ? `${site.name} emeklilik rehberi ve kalıcı yazılar.` : undefined}
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
