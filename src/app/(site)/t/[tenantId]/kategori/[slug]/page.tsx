import { KategoriView, kategoriMetadata } from "./kategori-view";
import type { Metadata } from "next";

export const revalidate = 60;
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
  return kategoriMetadata({ tenantId, slug, page: 1 });
}

export default async function KategoriPage({ params }: { params: Promise<Params> }) {
  const { tenantId, slug } = await params;
  return <KategoriView tenantId={tenantId} slug={slug} page={1} />;
}
