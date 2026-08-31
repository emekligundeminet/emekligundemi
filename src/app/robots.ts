import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

const DISALLOW = ["/admin", "/admin/", "/api/", "/ara", "/t/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: "Googlebot-News", allow: "/", disallow: DISALLOW },
    ],
    sitemap: [`${SITE_ORIGIN}/sitemap.xml`, `${SITE_ORIGIN}/news-sitemap.xml`],
    host: SITE_ORIGIN,
  };
}
