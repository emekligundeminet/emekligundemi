/**
 * Public URL → iç ISR yolu /t/{tenantId}/...
 * Kullanıcı adres çubuğunda /t görmez (middleware rewrite).
 * Not: Next.js'te _t özel klasör (private) olur, route olmaz.
 */
const SKIP_FIRST = new Set([
  "admin",
  "api",
  "t",
  "_next",
  // 308 kaynakları — rewrite'tan önce next.config yönlendirsin
  "cerez-politikasi",
  "gizlilik",
  "hakkimizda",
  "sitemap.xml",
  "news-sitemap.xml",
  "rss.xml",
  "robots.txt",
  "images",
]);

export function tenantCacheRewritePath(pathname: string, tenantId: string): string | null {
  if (!tenantId || pathname.startsWith("/t/")) return null;
  const first = pathname.split("/").filter(Boolean)[0];
  if (first && SKIP_FIRST.has(first)) return null;
  if (pathname === "/" || pathname === "") return `/t/${tenantId}`;
  return `/t/${tenantId}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
