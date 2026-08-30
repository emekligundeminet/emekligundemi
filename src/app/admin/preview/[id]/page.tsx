import { notFound, redirect } from "next/navigation";
import { ReaderArticleBlock } from "@/components/reader-article-block";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAdminContext } from "@/lib/admin-auth";
import { getArticleByIdForAdmin } from "@/lib/data/articles";
import { getSiteMeta } from "@/lib/site-meta";
import { getCategories } from "@/lib/store";
import { SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getAdminContext();
  if (!ctx.ok) {
    if (ctx.status === 401) redirect("/admin/login?next=/admin/preview");
    notFound();
  }
  const { id } = await params;
  const [article, site, categories] = await Promise.all([
    getArticleByIdForAdmin(ctx.tenantId, id),
    getSiteMeta(),
    getCategories(ctx.tenantId),
  ]);
  if (!article) notFound();
  const siteName = site?.name ?? SITE_NAME;
  const followHost = site?.origin.replace(/^https?:\/\//, "").split("/")[0] ?? "";

  return (
    <div className="min-h-screen bg-white text-[#1a1510]">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
        Önizleme — bu haber yayında olmayabilir.{" "}
        <a href={`/admin/articles/${id}/edit`} className="font-medium underline">
          Düzenlemeye dön
        </a>
      </div>
      <SiteHeader categories={categories} siteName={siteName} social={site?.social} />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ReaderArticleBlock
          article={article}
          siteName={siteName}
          articleUrl={`${(site?.origin ?? "").replace(/\/$/, "")}${article.canonical_path}`}
          followHost={followHost}
          priorityCover
        />
      </div>
      <SiteFooter categories={categories} siteName={siteName} social={site?.social} />
    </div>
  );
}
