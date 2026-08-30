import { NextResponse } from "next/server";
import { getTenant } from "@/lib/tenant";
import { getPublishedArticles } from "@/lib/data/articles";
import { toArticleCard } from "@/lib/site";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const tenant = await getTenant();
  if (!tenant) return NextResponse.json({ articles: [], total: 0 });

  const ip = clientIp(request);
  if (!rateLimit(`ara:${tenant.tenant_id}:${ip}`, 30, 60_000)) {
    return NextResponse.json({ message: "Çok fazla istek." }, { status: 429 });
  }

  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ articles: [], total: 0, q });

  try {
    const { articles, total } = await getPublishedArticles(tenant.tenant_id, {
      search: q,
      limit: 24,
    });
    return NextResponse.json({
      articles: articles.map(toArticleCard),
      total,
      q,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 500 }
    );
  }
}
