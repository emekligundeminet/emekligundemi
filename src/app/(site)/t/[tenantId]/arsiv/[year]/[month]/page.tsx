import { ArsivMonthView, arsivMonthMetadata } from "./arsiv-month-view";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { tenantId: string; year: string; month: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId, year, month } = await params;
  return arsivMonthMetadata({ tenantId, year, month, page: 1 });
}

export default async function ArsivMonthPage({ params }: { params: Promise<Params> }) {
  const { tenantId, year, month } = await params;
  return <ArsivMonthView tenantId={tenantId} year={year} month={month} page={1} />;
}
