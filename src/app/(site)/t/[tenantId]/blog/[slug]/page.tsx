import { ArticleViewTracker } from "@/components/article-view-tracker";
import { ReaderArticleBlock } from "@/components/reader-article-block";
import { authorPath } from "@/lib/author-slug";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { BLOG_INDEX_TITLE, HOME_TITLE } from "@/lib/site";
import { absolutePath, toAbsoluteUrl } from "@/lib/site-meta";
import { articleJsonLdByType } from "@/lib/public-article-url";
import { articleSocialMeta, wordCountFromHtml } from "@/lib/seo";
import { isGuide } from "@/lib/content-type";
import { cachedArticle, cachedSiteMeta } from "@/lib/cached-public";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [] as { tenantId: string; slug: string }[];
}

type Params = { tenantId: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId, slug } = await params;
  const [site, article] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedArticle(tenantId, slug),
  ]);
  if (!site || !article) return {};
  if (!isGuide(article.type)) {
    permanentRedirect(`/${article.slug}`);
  }
  const title = article.meta_title || article.title;
  const description = article.meta_description || article.excerpt || undefined;
  const canonical = absolutePath(site.origin, `/blog/${article.slug}`);
  const ogImage = toAbsoluteUrl(site.origin, article.cover_url);
  const modifiedTime = article.updated_at || article.published_at;
  return {
    title: { absolute: title },
    description,
    metadataBase: new URL(site.origin),
    ...articleSocialMeta({
      title,
      description,
      canonical,
      siteName: site.name,
      publishedAt: article.published_at,
      modifiedTime,
      ogImage,
      ogAlt: article.cover_alt || article.title,
      authors: article.author?.name ? [article.author.name] : undefined,
      section: BLOG_INDEX_TITLE,
    }),
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<Params> }) {
  const { tenantId, slug } = await params;
  const [site, article] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedArticle(tenantId, slug),
  ]);
  if (!site || !article) notFound();
  if (!isGuide(article.type)) {
    permanentRedirect(`/${article.slug}`);
  }

  const canonical = absolutePath(site.origin, `/blog/${article.slug}`);
  const coverAbs = toAbsoluteUrl(site.origin, article.cover_url);
  const jsonLd = [
    articleJsonLdByType(article.type, {
      title: article.title,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      excerpt: article.excerpt,
      coverAbs,
      canonical,
      siteName: site.name,
      logoUrl: site.logoUrl,
      authorName: article.author?.name ?? null,
      authorUrl: article.author ? `${site.origin}${authorPath(article.author.name)}` : null,
      section: BLOG_INDEX_TITLE,
      wordCount: wordCountFromHtml(article.content_html),
    }),
    breadcrumbJsonLd(site.origin, [
      { name: HOME_TITLE, path: "/" },
      { name: BLOG_INDEX_TITLE, path: "/blog" },
      { name: article.title, path: `/blog/${article.slug}` },
    ]),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ArticleViewTracker slug={article.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <ReaderArticleBlock
        article={article}
        siteName={site.name}
        articleUrl={canonical}
        priorityCover
      />
    </div>
  );
}
