import Link from "next/link";
import { ArchiveArticleList } from "@/components/archive-article-list";
import { FeedPagination } from "@/components/feed-pagination";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import {
  archiveMonthPath,
  archiveYearPath,
  monthRangeIso,
  monthTitle,
  parseArchiveMonth,
  parseArchiveYear,
} from "@/lib/archive";
import { cachedArchiveYears, cachedSiteMeta } from "@/lib/cached-public";
import { getPublishedArticles } from "@/lib/data/articles";
import { HOME_TITLE, staticDocumentTitle, toArticleCard } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const ARSIV_PAGE_SIZE = 24;

type Args = { tenantId: string; year: string; month: string; page: number };

export async function arsivMonthMetadata({ tenantId, year: y, month: m }: Args): Promise<Metadata> {
  const year = parseArchiveYear(y);
  const month = parseArchiveMonth(m);
  if (!year || !month) return {};
  const site = await cachedSiteMeta(tenantId);
  const path = archiveMonthPath(year, month);
  const title = monthTitle(year, month);
  return {
    title: { absolute: staticDocumentTitle(`${title} haberleri`) },
    description: `${title} tarihinde yayınlanan emeklilik haberleri.`,
    alternates: { canonical: site ? `${site.origin}${path}` : path },
    openGraph: { title: `${title} haberleri`, url: site ? `${site.origin}${path}` : path },
  };
}

export async function ArsivMonthView({ tenantId, year: y, month: m, page }: Args) {
  const year = parseArchiveYear(y);
  const month = parseArchiveMonth(m);
  if (!year || !month) notFound();

  const range = monthRangeIso(year, month);
  const [site, years, feed] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedArchiveYears(tenantId),
    getPublishedArticles(tenantId, {
      publishedFrom: range.start,
      publishedTo: range.end,
      limit: ARSIV_PAGE_SIZE,
      offset: (page - 1) * ARSIV_PAGE_SIZE,
    }),
  ]);
  if (!site) notFound();
  const hasMonth = years.some((b) => b.year === year && b.months.some((x) => x.month === month));
  if (!hasMonth && feed.total === 0) notFound();

  const title = monthTitle(year, month);
  const path = archiveMonthPath(year, month);
  const cards = feed.articles.map(toArticleCard);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd(site.origin, [
              { name: HOME_TITLE, path: "/" },
              { name: "Arşiv", path: "/arsiv" },
              { name: String(year), path: archiveYearPath(year) },
              { name: title, path },
            ])
          ),
        }}
      />
      <header className="border-b-2 border-[var(--brand)] pb-4">
        <nav className="text-sm text-neutral-500" aria-label="Sayfa yolu">
          <Link href="/arsiv" className="hover:text-[var(--brand)] hover:underline">
            Arşiv
          </Link>
          <span className="px-1.5" aria-hidden>
            &gt;
          </span>
          <Link href={archiveYearPath(year)} className="hover:text-[var(--brand)] hover:underline">
            {year}
          </Link>
        </nav>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{feed.total} haber</p>
      </header>
      <ArchiveArticleList cards={cards} logoSrc={site.logoUrl} />
      <FeedPagination basePath={path} page={page} total={feed.total} pageSize={ARSIV_PAGE_SIZE} />
    </div>
  );
}
