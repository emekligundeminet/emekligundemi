import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { Json } from "@/types/db";

export type TenantContext = {
  tenant_id: string;
  name: string;
  settings: Json;
};

/**
 * Host → lookup anahtarı. www düşer (www.emekliler.org = emekliler.org).
 * Production’da middleware ayrıca www’yi apex’e 308 eder; burası yedek.
 */
export function hostnameFromHostHeader(hostHeader: string | null): string | null {
  if (!hostHeader) return null;
  const host = hostHeader.split(",")[0]?.trim().toLowerCase() ?? "";
  const withoutPort = host.replace(/:\d+$/, "").replace(/\.$/, "");
  if (!withoutPort) return null;
  return withoutPort.startsWith("www.") ? withoutPort.slice(4) : withoutPort;
}

/** Hostname → tenant. middleware ve getTenant ortak kullanır. */
export async function lookupTenantByHostname(
  hostname: string | null
): Promise<TenantContext | null> {
  if (!hostname) return null;
  const lookupHost =
    hostname === "127.0.0.1" || hostname === "[::1]" ? "localhost" : hostname;

  const supabase = createSupabaseAdminClient();
  let { data: domain, error: domainError } = await supabase
    .from("domains")
    .select("tenant_id, verified")
    .eq("hostname", lookupHost)
    .eq("verified", true)
    .maybeSingle();

  // Yerel: domains’te localhost yoksa üretim hostuna düş (emekliler.org).
  if ((domainError || !domain?.tenant_id) && lookupHost === "localhost") {
    const retry = await supabase
      .from("domains")
      .select("tenant_id, verified")
      .eq("hostname", "emekliler.org")
      .eq("verified", true)
      .maybeSingle();
    domain = retry.data;
    domainError = retry.error;
  }

  if (domainError || !domain?.tenant_id) return null;

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, settings, status")
    .eq("id", domain.tenant_id)
    .maybeSingle();

  if (tenantError || !tenant || tenant.status !== "active") return null;

  return {
    tenant_id: tenant.id,
    name: tenant.name,
    settings: tenant.settings as Json,
  };
}

/** ISR sayfaları: tenant_id params'tan (headers yok). */
export async function lookupTenantById(tenantId: string): Promise<TenantContext | null> {
  if (!tenantId) return null;
  const supabase = createSupabaseAdminClient();
  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("id, name, settings, status")
    .eq("id", tenantId)
    .maybeSingle();
  if (error || !tenant || tenant.status !== "active") return null;
  return {
    tenant_id: tenant.id,
    name: tenant.name,
    settings: tenant.settings as Json,
  };
}
