import { BlogIndexView, blogIndexMetadata } from "./blog-view";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { tenantId: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId } = await params;
  return blogIndexMetadata({ tenantId, page: 1 });
}

export default async function BlogIndexPage({ params }: { params: Promise<Params> }) {
  const { tenantId } = await params;
  if (!tenantId) notFound();
  return <BlogIndexView tenantId={tenantId} page={1} />;
}
