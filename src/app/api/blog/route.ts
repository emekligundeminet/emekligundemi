import { NextResponse } from "next/server";
import { getTenant } from "@/lib/tenant";
import { getPublishedArticles } from "@/lib/data/articles";
import { toArticleCard } from "@/lib/site";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const tenant = await getTenant();
  if (!tenant) {
    return NextResponse.json({ articles: [], total: 0 });
  }
  if (!rateLimit(`blog:${tenant.tenant_id}:${clientIp(request)}`, 40, 60_000)) {
    return NextResponse.json({ message: "Çok fazla istek." }, { status: 429 });
  }
  const url = new URL(request.url);
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(20, Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20));

  try {
    const { articles, total } = await getPublishedArticles(tenant.tenant_id, {
      contentType: "guide",
      limit: offset + limit,
    });
    const page = articles.slice(offset, offset + limit);
    return NextResponse.json({
      articles: page.map(toArticleCard),
      total,
      offset,
      limit,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 500 }
    );
  }
}
