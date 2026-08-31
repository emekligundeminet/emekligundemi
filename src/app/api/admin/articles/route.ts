import { NextResponse } from "next/server";
import {
  forbidIfCannotPublish,
  forbidIfCannotWrite,
  isPublishStatus,
  requireAdminApi,
} from "@/lib/admin-auth";
import { assertPublishReady } from "@/lib/cover-image";
import { createArticle, getArticle, listArticles } from "@/lib/store";
import { revalidateTenantContent } from "@/lib/revalidate-tenant";
import { parseContentType } from "@/lib/content-type";
import type { ArticleStatus } from "@/types/article";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const data = await listArticles(ctx.tenantId);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;

  const body = (await request.json()) as {
    title?: string;
    slug?: string;
    excerpt?: string | null;
    content_html?: string | null;
    cover_url?: string | null;
    cover_alt?: string | null;
    category_id?: string | null;
    author_id?: string | null;
    source_id?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    canonical_url?: string | null;
    status?: ArticleStatus;
    is_breaking?: boolean;
    is_manset?: boolean;
    evergreen?: boolean;
    type?: string;
  };
  if (!body.title || !body.slug) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  if (isPublishStatus(body.status)) {
    const pub = forbidIfCannotPublish(ctx);
    if (pub) return pub;
  }
  if (body.status === "published") {
    try {
      await assertPublishReady({
        coverUrl: body.cover_url,
        authorId: body.author_id,
        excerpt: body.excerpt,
      });
    } catch (err) {
      return NextResponse.json(
        { message: err instanceof Error ? err.message : "Yayın şartı eksik." },
        { status: 400 }
      );
    }
  }
  try {
    const article = await createArticle(ctx.tenantId, {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? null,
      content_html: body.content_html ?? "",
      cover_url: body.cover_url ?? null,
      cover_alt: body.cover_alt ?? null,
      category_id: body.category_id?.trim() ? body.category_id : null,
      author_id: body.author_id?.trim() ? body.author_id : null,
      source_id: body.source_id?.trim() ? body.source_id : null,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
      canonical_url: body.canonical_url ?? null,
      status: body.status === "published" || body.status === "review" ? body.status : "draft",
      is_breaking: Boolean(body.is_breaking),
      is_manset: Boolean(body.is_manset),
      evergreen: Boolean(body.evergreen),
      type: parseContentType(body.type),
    });
    if (article.status === "published") {
      const full = await getArticle(ctx.tenantId, article.id);
      revalidateTenantContent({
        tenantId: ctx.tenantId,
        slugs: [full?.slug ?? article.slug],
        categorySlugs: [full?.category_slug],
      });
    }
    return NextResponse.json(article);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
