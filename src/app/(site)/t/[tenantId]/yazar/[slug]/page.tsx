import { YazarView, yazarMetadata } from "./yazar-view";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { tenantId: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId, slug } = await params;
  return yazarMetadata({ tenantId, slug, page: 1 });
}

export default async function YazarPage({ params }: { params: Promise<Params> }) {
  const { tenantId, slug } = await params;
  return <YazarView tenantId={tenantId} slug={slug} page={1} />;
}
