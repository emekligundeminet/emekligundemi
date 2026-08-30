import "server-only";

import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import { getArticleBySlug, getCategoryBySlug, getPublishedArticles, listPublishedAt, listPublishedSitemapArticles } from "@/lib/data/articles";
import { groupArchiveMonths } from "@/lib/archive";
import { getCategories } from "@/lib/store";
import { buildSiteMetaForTenant } from "@/lib/site-meta";
import { lookupTenantById } from "@/lib/tenant-lookup";
import { filterNewsSitemap } from "@/lib/content-type";

const ARTICLE_REVALIDATE = 3600;
const FEED_REVALIDATE = 60;
const XML_REVALIDATE = 300;

export function cachedTenant(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => lookupTenantById(tenantId),
    ["pub-tenant", tenantId],
    { revalidate: ARTICLE_REVALIDATE, tags: [tags.home] }
  )();
}

export function cachedSiteMeta(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => buildSiteMetaForTenant(tenantId),
    ["pub-site-meta", tenantId],
    { revalidate: ARTICLE_REVALIDATE, tags: [tags.home] }
  )();
}

export function cachedCategories(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => getCategories(tenantId),
    ["pub-categories", tenantId],
    { revalidate: FEED_REVALIDATE, tags: [tags.home, tags.categories] }
  )();
}

export function cachedArticle(tenantId: string, slug: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => getArticleBySlug(tenantId, null, slug),
    ["pub-article", tenantId, slug],
    {
      revalidate: ARTICLE_REVALIDATE,
      tags: [tags.article(slug), tags.articles],
    }
  )();
}

export function cachedHomeArticles(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => {
      return getPublishedArticles(tenantId, {
        limit: 80,
        contentType: "news",
      }).then((r) => r.articles);
    },
    ["pub-home-articles", tenantId],
    { revalidate: FEED_REVALIDATE, tags: [tags.home, tags.articles] }
  )();
}

export function cachedBlogArticles(tenantId: string, page = 1) {
  const tags = cacheTags(tenantId);
  const safePage = Math.max(1, page);
  const pageSize = 24;
  return unstable_cache(
    async () => {
      return getPublishedArticles(tenantId, {
        contentType: "guide",
        limit: pageSize,
        offset: (safePage - 1) * pageSize,
      }).then((r) => ({ ...r, page: safePage, pageSize }));
    },
    ["pub-blog-articles", tenantId, String(safePage)],
    { revalidate: FEED_REVALIDATE, tags: [tags.blog, tags.articles] }
  )();
}

export function cachedCategoryPage(tenantId: string, categorySlug: string, page = 1) {
  const tags = cacheTags(tenantId);
  const safePage = Math.max(1, page);
  const pageSize = 24;
  return unstable_cache(
    async () => {
      const kat = await getCategoryBySlug(tenantId, categorySlug);
      if (!kat) return null;
      const feed = await getPublishedArticles(tenantId, {
        categoryId: kat.id,
        limit: pageSize,
        offset: (safePage - 1) * pageSize,
      });
      return { kat, page: safePage, pageSize, ...feed };
    },
    ["pub-category", tenantId, categorySlug, String(safePage)],
    {
      revalidate: FEED_REVALIDATE,
      tags: [tags.category(categorySlug), tags.articles],
    }
  )();
}

export function cachedRelatedArticles(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => {
      return getPublishedArticles(tenantId, { limit: 8, contentType: "news" }).then((r) => r.articles);
    },
    ["pub-related", tenantId],
    { revalidate: FEED_REVALIDATE, tags: [tags.articles, tags.home] }
  )();
}

export function cachedSitemapData(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => {
      const [articles, categories] = await Promise.all([
        listPublishedSitemapArticles(tenantId),
        getCategories(tenantId),
      ]);
      return { articles, categories };
    },
    ["pub-sitemap", tenantId],
    { revalidate: XML_REVALIDATE, tags: [tags.articles, tags.home] }
  )();
}

export function cachedRssArticles(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => {
      return getPublishedArticles(tenantId, { limit: 20, contentType: "news" });
    },
    ["pub-rss", tenantId],
    { revalidate: XML_REVALIDATE, tags: [tags.articles] }
  )();
}

const NEWS_WINDOW_MS = 48 * 60 * 60 * 1000;

export function cachedNewsSitemapArticles(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => {
      const since = new Date(Date.now() - NEWS_WINDOW_MS);
      const rows = await listPublishedSitemapArticles(tenantId, {
        since,
        contentType: "news",
      });
      return filterNewsSitemap(rows);
    },
    ["pub-news-sitemap", tenantId],
    { revalidate: XML_REVALIDATE, tags: [tags.articles] }
  )();
}

export function cachedArchiveYears(tenantId: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => groupArchiveMonths(await listPublishedAt(tenantId)),
    ["pub-archive-years", tenantId],
    { revalidate: FEED_REVALIDATE, tags: [tags.articles] }
  )();
}
