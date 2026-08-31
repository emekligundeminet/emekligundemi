/** Yasal sayfalar /t/[tenantId] altında ISR + SiteChrome (headers yok). */
export const revalidate = 3600;

export default function TenantLegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
