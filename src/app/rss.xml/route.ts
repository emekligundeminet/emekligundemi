import { NextResponse } from "next/server";
import { absolutePath, getSiteMeta } from "@/lib/site-meta";
import { cachedRssArticles } from "@/lib/cached-public";
import { xmlEscape } from "@/lib/xml";

export const revalidate = 300;

export async function GET() {
  const site = await getSiteMeta();
  if (!site) {
    return new NextResponse("Tenant bulunamadı.", { status: 404 });
  }

  const { articles } = await cachedRssArticles(site.tenantId);

  const items = articles
    .map((a) => {
      const link = xmlEscape(absolutePath(site.origin, `/${a.slug}`));
      const title = xmlEscape(a.title);
      const description = xmlEscape(a.excerpt || a.title);
      const pubDate = a.published_at ? new Date(a.published_at).toUTCString() : "";
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      ${pubDate ? `<pubDate>${xmlEscape(pubDate)}</pubDate>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${xmlEscape(site.name)}</title>
    <link>${xmlEscape(site.origin)}</link>
    <description>${xmlEscape(site.description)}</description>
    <language>tr</language>
${items}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
