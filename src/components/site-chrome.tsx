import { CookieBanner } from "@/components/cookie-banner";
import { ConsentScripts } from "@/components/consent-scripts";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppChannelRail } from "@/components/whatsapp-channel-rail";
import { cachedCategories, cachedSiteMeta } from "@/lib/cached-public";
import { BRAND_FALLBACK, SITE_NAME } from "@/lib/site";

/** ISR ve yasal sayfalar ortak kabuk. tenantId params/host'tan gelir. */
export async function SiteChrome({
  tenantId,
  children,
}: {
  tenantId: string;
  children: React.ReactNode;
}) {
  const [site, categories] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedCategories(tenantId),
  ]);
  const siteName = site?.name ?? SITE_NAME;
  const brand = site?.primaryColor?.trim() || BRAND_FALLBACK;

  return (
    <div
      className="flex min-h-screen flex-col bg-white text-[#1a1510]"
      style={{
        ["--brand" as string]: brand,
        ["--primary" as string]: brand,
        ["--ring" as string]: brand,
      }}
    >
      <SiteHeader categories={categories} siteName={siteName} social={site?.social} />
      <div className="flex-1">{children}</div>
      <SiteFooter categories={categories} siteName={siteName} social={site?.social} />
      <CookieBanner />
      <WhatsAppChannelRail href={site?.social.whatsapp} />
      <ConsentScripts />
    </div>
  );
}
