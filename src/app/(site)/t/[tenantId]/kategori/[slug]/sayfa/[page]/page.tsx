import { parseFeedPage } from "@/lib/feed-page";
import { notFound, permanentRedirect } from "next/navigation";
import { KategoriView, kategoriMetadata } from "../../kategori-view";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return [] as { tenantId: string; slug: string; page: string }[];
}

type Params = { tenantId: string; slug: string; page: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId, slug, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page) return {};
  if (page === 1) permanentRedirect(`/kategori/${slug}`);
  return kategoriMetadata({ tenantId, slug, page });
}

export default async function KategoriPaged({ params }: { params: Promise<Params> }) {
  const { tenantId, slug, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page) notFound();
  if (page === 1) permanentRedirect(`/kategori/${slug}`);
  return <KategoriView tenantId={tenantId} slug={slug} page={page} />;
}
