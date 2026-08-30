import { SiteChrome } from "@/components/site-chrome";
import { cachedSiteMeta, cachedTenant } from "@/lib/cached-public";
import { BRAND_LOGO, HOME_TITLE, SITE_TAGLINE, TITLE_SUFFIX } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

/** On-demand ISR — tenant path'leri ilk istekte üretilir. */
export function generateStaticParams() {
  return [] as { tenantId: string }[];
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ tenantId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantId } = await params;
  const site = await cachedSiteMeta(tenantId);
  return {
    title: { default: HOME_TITLE, template: `%s | ${TITLE_SUFFIX}` },
    description: site?.description ?? SITE_TAGLINE,
    metadataBase: site ? new URL(site.origin) : undefined,
    icons: {
      icon: [{ url: BRAND_LOGO.favicon, type: "image/svg+xml" }],
      apple: BRAND_LOGO.favicon,
    },
    openGraph: {
      images: [{ url: BRAND_LOGO.onRed }],
    },
  };
}

export default async function TenantSiteLayout({ children, params }: Props) {
  const { tenantId } = await params;
  const tenant = await cachedTenant(tenantId);
  if (!tenant) notFound();
  return <SiteChrome tenantId={tenant.tenant_id}>{children}</SiteChrome>;
}
