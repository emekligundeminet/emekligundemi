import Link from "next/link";
import { SiteSearchForm } from "@/components/site-search-form";
import { CoverMedia } from "@/components/cover-media";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { cachedSiteMeta } from "@/lib/cached-public";
import { getPublishedArticles } from "@/lib/data/articles";
import { formatNewsDate, staticDocumentTitle, toArticleCard } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ tenantId: string }>;
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { tenantId } = await params;
  const { q } = await searchParams;
  const site = await cachedSiteMeta(tenantId);
  const query = q?.trim() ?? "";
  const title = query ? `Arama: ${query}` : "Haber ara";
  return {
    title: { absolute: staticDocumentTitle(title) },
    robots: { index: false, follow: true },
    alternates: { canonical: site ? `${site.origin}/ara` : "/ara" },
  };
}

export default async function AraPage({ params, searchParams }: Props) {
  const { tenantId } = await params;
  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 80);
  const site = await cachedSiteMeta(tenantId);
  if (!site) notFound();

  const feed =
    query.length >= 2
      ? await getPublishedArticles(tenantId, { search: query, limit: 24 })
      : { articles: [], total: 0 };

  const cards = feed.articles.map(toArticleCard);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd(site.origin, [
              { name: "Emekli Haberleri", path: "/" },
              { name: "Arama", path: "/ara" },
            ])
          ),
        }}
      />
      <h1 className="text-3xl font-extrabold">Haber ara</h1>
      <div className="mt-5">
        <SiteSearchForm />
      </div>
      {query.length > 0 && query.length < 2 ? (
        <p className="mt-6 text-neutral-600">En az 2 karakter yazın.</p>
      ) : null}
      {query.length >= 2 ? (
        <p className="mt-6 text-sm text-neutral-500">
          “{query}” için {feed.total} sonuç
        </p>
      ) : null}
      <ul className="mt-6 divide-y divide-neutral-200">
        {cards.map((card) => (
          <li key={card.id} className="py-4">
            <Link href={card.href} className="grid grid-cols-[7rem_1fr] gap-4 sm:grid-cols-[9rem_1fr]">
              <CoverMedia
                src={card.image}
                alt={card.alt}
                className="aspect-[16/9] w-full"
                sizes={IMG_SIZES.row}
                logoSrc={site.logoUrl}
              />
              <div>
                <p className="text-lg font-extrabold leading-snug hover:text-[var(--brand)]">
                  {card.title}
                </p>
                {card.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-[15px] text-neutral-600">{card.excerpt}</p>
                ) : null}
                {card.published_at ? (
                  <p className="mt-1 text-sm text-neutral-500">{formatNewsDate(card.published_at)}</p>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
