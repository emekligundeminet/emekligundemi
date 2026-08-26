import { NextResponse } from "next/server";
import { deleteArticle, getArticle, updateArticle } from "@/lib/store";
import type { ArticleStatus } from "@/types/article";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) {
    return NextResponse.json({ message: "Bulunamadı." }, { status: 404 });
  }
  return NextResponse.json(article);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as {
    title?: string;
    slug?: string;
    category?: string | null;
    content?: string;
    status?: ArticleStatus;
  };
  try {
    const article = await updateArticle(id, {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.content !== undefined ? { content: body.content } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    });
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
  const { id } = await params;
  try {
    await deleteArticle(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
