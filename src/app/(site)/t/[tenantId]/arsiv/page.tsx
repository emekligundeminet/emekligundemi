import Link from "next/link";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { archiveMonthPath, archiveYearPath, monthTitle } from "@/lib/archive";
import { cachedArchiveYears, cachedSiteMeta } from "@/lib/cached-public";
import { NOINDEX_FOLLOW_ROBOTS } from "@/lib/seo";
import { HOME_TITLE, staticDocumentTitle } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ tenantId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantId } = await params;
  const site = await cachedSiteMeta(tenantId);
  return {
    title: { absolute: staticDocumentTitle("Haber arşivi") },
    description: "Emekliler.org haber arşivi — yıl ve aya göre.",
    robots: NOINDEX_FOLLOW_ROBOTS,
    alternates: { canonical: site ? `${site.origin}/arsiv` : "/arsiv" },
    openGraph: { title: "Haber arşivi", url: site ? `${site.origin}/arsiv` : "/arsiv" },
  };
}

export default async function ArsivIndexPage({ params }: Props) {
  const { tenantId } = await params;
  const [site, years] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedArchiveYears(tenantId),
  ]);
  if (!site) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd(site.origin, [
              { name: HOME_TITLE, path: "/" },
              { name: "Arşiv", path: "/arsiv" },
            ])
          ),
        }}
      />
      <header className="border-b-2 border-[var(--brand)] pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Haber arşivi</h1>
        <p className="mt-2 max-w-2xl text-base text-neutral-600">
          Haberler yayın tarihine göre. Kategori değil; “Ağustos 2026’da ne çıktı?” sorusu buradan.
        </p>
      </header>

      {years.length === 0 ? (
        <p className="mt-8 text-neutral-600">Henüz arşivlenecek yayın yok.</p>
      ) : (
        <div className="mt-8 space-y-10">
          {years.map((block) => (
            <section key={block.year}>
              <h2 className="text-xl font-extrabold">
                <Link href={archiveYearPath(block.year)} className="hover:text-[var(--brand)]">
                  {block.year}
                </Link>
                <span className="ml-2 text-sm font-normal text-neutral-500">{block.count} haber</span>
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {block.months.map((m) => (
                  <li key={`${m.year}-${m.month}`}>
                    <Link
                      href={archiveMonthPath(m.year, m.month)}
                      className="inline-flex min-h-11 items-center rounded-md border border-neutral-200 px-3 text-sm font-semibold hover:border-neutral-900"
                    >
                      {monthTitle(m.year, m.month)}
                      <span className="ml-2 text-neutral-500">{m.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
