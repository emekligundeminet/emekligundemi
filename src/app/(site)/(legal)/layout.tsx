import { SiteChrome } from "@/components/site-chrome";
import { getSiteMeta } from "@/lib/site-meta";
import { getTenant } from "@/lib/tenant";
import { SITE_TAGLINE } from "@/lib/site";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteMeta();
  return {
    description: site?.description ?? SITE_TAGLINE,
    metadataBase: site ? new URL(site.origin) : undefined,
  };
}

/** Yasal sayfalar: hostname → tenant (ISR değil). */
export default async function LegalLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getTenant();
  if (!tenant) notFound();
  return <SiteChrome tenantId={tenant.tenant_id}>{children}</SiteChrome>;
}
