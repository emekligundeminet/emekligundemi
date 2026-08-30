import { archiveMonthPath, parseArchiveMonth, parseArchiveYear } from "@/lib/archive";
import { parseFeedPage } from "@/lib/feed-page";
import { notFound, permanentRedirect } from "next/navigation";
import { ArsivMonthView, arsivMonthMetadata } from "../../arsiv-month-view";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return [] as { tenantId: string; year: string; month: string; page: string }[];
}

type Params = { tenantId: string; year: string; month: string; page: string };

function monthBasePath(yearRaw: string, monthRaw: string) {
  const year = parseArchiveYear(yearRaw);
  const month = parseArchiveMonth(monthRaw);
  if (!year || !month) return "/arsiv";
  return archiveMonthPath(year, month);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId, year, month, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page) return {};
  if (page === 1) permanentRedirect(monthBasePath(year, month));
  return arsivMonthMetadata({ tenantId, year, month, page });
}

export default async function ArsivMonthPaged({ params }: { params: Promise<Params> }) {
  const { tenantId, year, month, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page) notFound();
  if (page === 1) permanentRedirect(monthBasePath(year, month));
  return <ArsivMonthView tenantId={tenantId} year={year} month={month} page={page} />;
}
