import { AdminLoginForm } from "@/components/admin-login-form";
import { BRAND_FALLBACK, BRAND_LOGO } from "@/lib/site";
import { getSiteMeta, toAbsoluteUrl } from "@/lib/site-meta";
import { getTenant } from "@/lib/tenant";
import type { Json } from "@/types/db";

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function settingsRecord(settings: Json): Record<string, unknown> {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return settings as Record<string, unknown>;
  }
  return {};
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath =
    typeof next === "string" && next.startsWith("/admin") ? next : "/admin/dashboard";

  const [site, tenant] = await Promise.all([getSiteMeta(), getTenant()]);
  const settings = tenant ? settingsRecord(tenant.settings) : {};
  const logoRaw = str(settings.logo_url) ?? str(settings.logo);
  const origin = site?.origin ?? "";
  const logoUrl =
    (logoRaw && origin ? toAbsoluteUrl(origin, logoRaw) : null) ?? BRAND_LOGO.color;

  return (
    <AdminLoginForm
      nextPath={nextPath}
      siteName={site?.name ?? tenant?.name ?? "Yayın paneli"}
      logoUrl={logoUrl}
      primaryColor={site?.primaryColor ?? BRAND_FALLBACK}
      tagline={site?.description ?? "Yayın yönetim paneli"}
    />
  );
}
