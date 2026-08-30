import Link from "next/link";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import {
  archiveMonthPath,
  archiveYearPath,
  monthTitle,
  parseArchiveYear,
} from "@/lib/archive";
import { cachedArchiveYears, cachedSiteMeta } from "@/lib/cached-public";
import { HOME_TITLE } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ tenantId: string; year: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantId, year: raw } = await params;
  const year = parseArchiveYear(raw);
  if (!year) return {};
  const site = await cachedSiteMeta(tenantId);
  const path = archiveYearPath(year);
  const title = `${year} haber arşivi`;
  return {
    title,
    description: `${year} yılında yayınlanan emeklilik haberleri.`,
    alternates: { canonical: site ? `${site.origin}${path}` : path },
    openGraph: { title, url: site ? `${site.origin}${path}` : path },
  };
}

export default async function ArsivYearPage({ params }: Props) {
  const { tenantId, year: raw } = await params;
  const year = parseArchiveYear(raw);
  if (!year) notFound();

  const [site, years] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedArchiveYears(tenantId),
  ]);
  if (!site) notFound();
  const block = years.find((y) => y.year === year);
  if (!block) notFound();

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
            ])
          ),
        }}
      />
      <header className="border-b-2 border-[var(--brand)] pb-4">
        <p className="text-sm text-neutral-500">
          <Link href="/arsiv" className="hover:text-[var(--brand)] hover:underline">
            Arşiv
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">{year}</h1>
        <p className="mt-2 text-sm text-neutral-500">{block.count} haber</p>
      </header>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {block.months.map((m) => (
          <li key={m.month}>
            <Link
              href={archiveMonthPath(m.year, m.month)}
              className="flex min-h-11 items-center justify-between border-b border-neutral-200 py-3 text-[15px] font-semibold hover:text-[var(--brand)]"
            >
              <span className="capitalize">{monthTitle(m.year, m.month)}</span>
              <span className="font-normal text-neutral-500">{m.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
