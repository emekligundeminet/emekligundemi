import type { MetadataRoute } from "next";
import { absolutePath, getSiteMeta } from "@/lib/site-meta";
import { cachedArchiveYears, cachedSitemapData } from "@/lib/cached-public";
import { archiveMonthPath, archiveYearPath } from "@/lib/archive";
import { articlePath, isGuide, isReservedBlogIndexSlug } from "@/lib/content-type";
import { authorPath } from "@/lib/author-slug";
import { getAuthors } from "@/lib/store";
import { listYayindaYasal } from "@/lib/yasal";
import { isKurumsalYasalSlug, yasalPath } from "@/types/yasal";

export const revalidate = 300;

const STATIC_PATHS = [
  "/",
  "/blog",
  "/arac/emekli-maasi-hesaplama",
  "/araclar/emekli-zam-hesaplama",
  "/araclar/emekli-bayram-ikramiyesi",
  "/araclar/alim-gucu-kaybi",
  "/iletisim",
  "/kunye",
  "/reklam",
  "/kvkk",
  "/aydinlatma-metni",
  "/hakkimizda",
  "/yayin-ilkeleri",
  "/duzeltme",
  "/arsiv",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSiteMeta();
  if (!site) return [];
  const [{ articles, categories }, authors, yasal, archiveYears] = await Promise.all([
    cachedSitemapData(site.tenantId),
    getAuthors(site.tenantId),
    listYayindaYasal(),
    cachedArchiveYears(site.tenantId),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absolutePath(site.origin, path),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "hourly" : "weekly",
    priority: path === "/" ? 1 : 0.5,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((kat) => !isReservedBlogIndexSlug(kat.slug))
    .map((kat) => ({
      url: absolutePath(site.origin, `/kategori/${kat.slug}`),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }));

  const archiveEntries: MetadataRoute.Sitemap = archiveYears.flatMap((block) => [
    {
      url: absolutePath(site.origin, archiveYearPath(block.year)),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    },
    ...block.months.map((m) => ({
      url: absolutePath(site.origin, archiveMonthPath(m.year, m.month)),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.45,
    })),
  ]);

  const yasalEntries: MetadataRoute.Sitemap = yasal
    .filter((row) => !isKurumsalYasalSlug(row.slug))
    .map((row) => ({
      url: absolutePath(site.origin, yasalPath(row.slug)),
      lastModified: row.guncelleme_tarihi ? new Date(row.guncelleme_tarihi) : new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    }));

  const authorEntries: MetadataRoute.Sitemap = authors.map((author) => ({
    url: absolutePath(site.origin, authorPath(author.name)),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => {
    const path = articlePath(a);
    return {
      url: absolutePath(site.origin, path),
      lastModified: new Date(a.updated_at || a.published_at),
      changeFrequency: isGuide(a.type) ? "monthly" : "weekly",
      priority: isGuide(a.type) ? 0.6 : 0.8,
    };
  });

  return [
    ...staticEntries,
    ...yasalEntries,
    ...archiveEntries,
    ...categoryEntries,
    ...authorEntries,
    ...articleEntries,
  ];
}
