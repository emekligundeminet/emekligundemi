import { parseFeedPage } from "@/lib/feed-page";
import { notFound, permanentRedirect } from "next/navigation";
import { BlogIndexView, blogIndexMetadata } from "../../blog-view";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return [] as { tenantId: string; page: string }[];
}

type Params = { tenantId: string; page: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page) return {};
  if (page === 1) permanentRedirect("/blog");
  return blogIndexMetadata({ tenantId, page });
}

export default async function BlogPaged({ params }: { params: Promise<Params> }) {
  const { tenantId, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page || !tenantId) notFound();
  if (page === 1) permanentRedirect("/blog");
  return <BlogIndexView tenantId={tenantId} page={page} />;
}
