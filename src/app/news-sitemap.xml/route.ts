import { NextResponse } from "next/server";
import { absolutePath, getSiteMeta } from "@/lib/site-meta";
import { cachedNewsSitemapArticles } from "@/lib/cached-public";
import { xmlEscape } from "@/lib/xml";

export const revalidate = 300;

export async function GET() {
  const site = await getSiteMeta();
  if (!site) {
    return new NextResponse("Tenant bulunamadı.", { status: 404 });
  }

  const articles = await cachedNewsSitemapArticles(site.tenantId);
  const name = xmlEscape(site.name);

  const urls = articles
    .map((a) => {
      const loc = xmlEscape(absolutePath(site.origin, `/${a.slug}`));
      const title = xmlEscape(a.title);
      const date = xmlEscape(a.published_at);
      const image = a.cover_url
        ? `\n    <image:image>\n      <image:loc>${xmlEscape(a.cover_url)}</image:loc>\n    </image:image>`
        : "";
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${date}</lastmod>
    <news:news>
      <news:publication>
        <news:name>${name}</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${date}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>${image}
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
