import { NotFoundBody } from "@/components/not-found-body";
import { SiteChrome } from "@/components/site-chrome";
import { getTenant } from "@/lib/tenant";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Sayfa bulunamadı | Emekliler.org" },
  robots: { index: false, follow: true },
};

export default async function RootNotFound() {
  const tenant = await getTenant();
  const body = <NotFoundBody />;
  if (!tenant) return body;
  return <SiteChrome tenantId={tenant.tenant_id}>{body}</SiteChrome>;
}
