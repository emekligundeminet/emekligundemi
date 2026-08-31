import { NextResponse } from "next/server";
import { absolutePath, getSiteMeta, toAbsoluteUrl } from "@/lib/site-meta";
import { cachedRssArticles } from "@/lib/cached-public";
import { xmlEscape } from "@/lib/xml";

export const revalidate = 300;

export async function GET() {
  const site = await getSiteMeta();
  if (!site) {
    return new NextResponse("Tenant bulunamadı.", { status: 404 });
  }

  const { articles } = await cachedRssArticles(site.tenantId);
  const feedUrl = `${site.origin}/rss.xml`;
  const built = new Date().toUTCString();

  const items = articles
    .map((a) => {
      const link = xmlEscape(absolutePath(site.origin, `/${a.slug}`));
      const title = xmlEscape(a.title);
      const description = xmlEscape(a.excerpt || a.title);
      const pubDate = a.published_at ? new Date(a.published_at).toUTCString() : "";
      const cover = toAbsoluteUrl(site.origin, a.cover_url);
      const enclosure = cover
        ? `\n      <enclosure url="${xmlEscape(cover)}" type="image/webp" />`
        : "";
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <description>${description}</description>
      ${pubDate ? `<pubDate>${xmlEscape(pubDate)}</pubDate>` : ""}${enclosure}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(site.name)}</title>
    <link>${xmlEscape(site.origin)}</link>
    <description>${xmlEscape(site.description)}</description>
    <language>tr</language>
    <lastBuildDate>${xmlEscape(built)}</lastBuildDate>
    <ttl>5</ttl>
    <atom:link href="${xmlEscape(feedUrl)}" rel="self" type="application/rss+xml" />
    <image>
      <url>${xmlEscape(site.logoUrl)}</url>
      <title>${xmlEscape(site.name)}</title>
      <link>${xmlEscape(site.origin)}</link>
    </image>
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
