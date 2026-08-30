import "server-only";

import { cache } from "react";
import { getTenant } from "@/lib/tenant";
import { lookupTenantById, type TenantContext } from "@/lib/tenant-lookup";
import { BRAND_FALLBACK, BRAND_LOGO, SITE_NAME, SITE_ORIGIN, SITE_TAGLINE } from "@/lib/site";
import type { Json } from "@/types/db";

export type SiteMeta = {
  tenantId: string;
  name: string;
  origin: string;
  /** Google News publisher.logo için en az 112px yükseklik önerilir. */
  logoUrl: string;
  description: string;
  social: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
  primaryColor: string;
};

function asRecord(settings: Json): Record<string, unknown> {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return settings as Record<string, unknown>;
  }
  return {};
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** Göreli kapak/logo URL'sini origin ile mutlak hale getirir. */
export function toAbsoluteUrl(origin: string, url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `${origin}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export function absolutePath(origin: string, path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

/** Public canonical her zaman emekliler.org. Localhost’ta SITE_ORIGIN (env). */
function publicOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_ORIGIN).replace(/\/$/, "");
  if (/localhost|127\.0\.0\.1/i.test(raw)) return raw;
  return SITE_ORIGIN;
}

function metaFromTenant(tenant: TenantContext, origin: string): SiteMeta {
  const settings = asRecord(tenant.settings);
  const name = str(settings.site_name) ?? str(settings.name) ?? tenant.name ?? SITE_NAME;
  const description = str(settings.description) ?? str(settings.tagline) ?? SITE_TAGLINE;
  const logoRaw = str(settings.logo_url) ?? str(settings.logo);
  const logoUrl =
    toAbsoluteUrl(origin, logoRaw) ?? `${origin}${BRAND_LOGO.color}`;
  return {
    tenantId: tenant.tenant_id,
    name,
    origin,
    logoUrl,
    description,
    social: {
      twitter: str(settings.twitter),
      facebook: str(settings.facebook),
      instagram: str(settings.instagram),
      whatsapp: str(settings.whatsapp),
    },
    primaryColor: str(settings.primary_color) ?? BRAND_FALLBACK,
  };
}

export async function buildSiteMetaForTenant(tenantId: string): Promise<SiteMeta | null> {
  const tenant = await lookupTenantById(tenantId);
  if (!tenant) return null;
  return metaFromTenant(tenant, publicOrigin());
}

/**
 * Host header'dan tenant. Sitemap/admin — sayfayı dynamic yapar.
 */
export const getSiteMeta = cache(async (): Promise<SiteMeta | null> => {
  const tenant = await getTenant();
  if (!tenant) return null;
  return metaFromTenant(tenant, publicOrigin());
});
