import { NextResponse } from "next/server";
import { createArticle, listArticles } from "@/lib/store";
import type { ArticleStatus } from "@/types/article";

export async function GET() {
  const data = await listArticles();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    slug?: string;
    category?: string | null;
    content?: string;
    status?: ArticleStatus;
  };
  if (!body.title || !body.slug) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const article = await createArticle({
      title: body.title,
      slug: body.slug,
      category: body.category ?? null,
      content: body.content ?? "",
      status: body.status === "published" ? "published" : "draft",
    });
    return NextResponse.json(article);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
