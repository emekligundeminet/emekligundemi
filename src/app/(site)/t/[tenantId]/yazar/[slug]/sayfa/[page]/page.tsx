import { authorPath } from "@/lib/author-slug";
import { parseFeedPage } from "@/lib/feed-page";
import { getAuthorBySlug } from "@/lib/store";
import { notFound, permanentRedirect } from "next/navigation";
import { YazarView, yazarMetadata } from "../../yazar-view";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return [] as { tenantId: string; slug: string; page: string }[];
}

type Params = { tenantId: string; slug: string; page: string };

async function yazarBasePath(tenantId: string, slug: string) {
  const author = await getAuthorBySlug(tenantId, slug);
  return author ? authorPath(author.name) : `/yazar/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId, slug, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page) return {};
  if (page === 1) permanentRedirect(await yazarBasePath(tenantId, slug));
  return yazarMetadata({ tenantId, slug, page });
}

export default async function YazarPaged({ params }: { params: Promise<Params> }) {
  const { tenantId, slug, page: raw } = await params;
  const page = parseFeedPage(raw);
  if (!page) notFound();
  if (page === 1) permanentRedirect(await yazarBasePath(tenantId, slug));
  return <YazarView tenantId={tenantId} slug={slug} page={page} />;
}
