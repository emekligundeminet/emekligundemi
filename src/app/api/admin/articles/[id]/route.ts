import { NextResponse } from "next/server";
import {
  forbidIfCannotPublish,
  forbidIfCannotWrite,
  isPublishStatus,
  requireAdminApi,
} from "@/lib/admin-auth";
import { deleteArticle, getArticle, publishArticle, updateArticle } from "@/lib/store";
import { revalidateTenantContent } from "@/lib/revalidate-tenant";
import { parseContentType } from "@/lib/content-type";
import type { ArticleStatus } from "@/types/article";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const { id: articleId } = await params;
  const article = await getArticle(ctx.tenantId, articleId);
  if (!article) {
    return NextResponse.json({ message: "Bulunamadı." }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;
  const { id: articleId } = await params;
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
    publish?: boolean;
  };
  if (body.publish || isPublishStatus(body.status)) {
    const pub = forbidIfCannotPublish(ctx);
    if (pub) return pub;
  }
  try {
    const before = await getArticle(ctx.tenantId, articleId);
    if (body.publish) {
      const article = await publishArticle(ctx.tenantId, articleId);
      const after = await getArticle(ctx.tenantId, articleId);
      revalidateTenantContent({
        tenantId: ctx.tenantId,
        slugs: [before?.slug, article.slug, after?.slug].filter(Boolean) as string[],
        categorySlugs: [before?.category_slug, after?.category_slug],
      });
      return NextResponse.json(article);
    }
    const article = await updateArticle(ctx.tenantId, articleId, {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
      ...(body.content_html !== undefined ? { content_html: body.content_html } : {}),
      ...(body.cover_url !== undefined ? { cover_url: body.cover_url } : {}),
      ...(body.cover_alt !== undefined ? { cover_alt: body.cover_alt } : {}),
      ...(body.category_id !== undefined
        ? { category_id: body.category_id?.trim() ? body.category_id : null }
        : {}),
      ...(body.author_id !== undefined
        ? { author_id: body.author_id?.trim() ? body.author_id : null }
        : {}),
      ...(body.source_id !== undefined
        ? { source_id: body.source_id?.trim() ? body.source_id : null }
        : {}),
      ...(body.meta_title !== undefined ? { meta_title: body.meta_title } : {}),
      ...(body.meta_description !== undefined
        ? { meta_description: body.meta_description }
        : {}),
      ...(body.canonical_url !== undefined ? { canonical_url: body.canonical_url } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.is_breaking !== undefined ? { is_breaking: Boolean(body.is_breaking) } : {}),
      ...(body.is_manset !== undefined ? { is_manset: Boolean(body.is_manset) } : {}),
      ...(body.evergreen !== undefined ? { evergreen: Boolean(body.evergreen) } : {}),
      ...(body.type !== undefined ? { type: parseContentType(body.type) } : {}),
    });
    const after = await getArticle(ctx.tenantId, articleId);
    const touchedPublished =
      before?.status === "published" ||
      after?.status === "published" ||
      article.status === "published";
    if (touchedPublished) {
      revalidateTenantContent({
        tenantId: ctx.tenantId,
        slugs: [before?.slug, article.slug, after?.slug].filter(Boolean) as string[],
        categorySlugs: [before?.category_slug, after?.category_slug],
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;
  const { id: articleId } = await params;
  try {
    const before = await getArticle(ctx.tenantId, articleId);
    await deleteArticle(ctx.tenantId, articleId);
    if (before) {
      revalidateTenantContent({
        tenantId: ctx.tenantId,
        slugs: [before.slug],
        categorySlugs: [before.category_slug],
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
