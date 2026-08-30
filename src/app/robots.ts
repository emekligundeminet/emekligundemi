import type { MetadataRoute } from "next";
import { getSiteMeta } from "@/lib/site-meta";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSiteMeta();
  if (!site) {
    return {
      rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/admin/", "/api/", "/ara"] }],
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/ara"],
      },
    ],
    sitemap: [`${site.origin}/sitemap.xml`, `${site.origin}/news-sitemap.xml`],
    host: site.origin,
  };
}
