import "server-only";

import { headers } from "next/headers";
import {
  hostnameFromHostHeader,
  lookupTenantByHostname,
  type TenantContext,
} from "@/lib/tenant-lookup";

export type { TenantContext };

/**
 * Hostname → tenant. RLS anon'da tenant ayırmaz; publik sorgular
 * dönen tenant_id ile FİLTRELENMELİ. Bu dosya server-only'dir,
 * tenant_id client bundle'a girmez.
 */
export async function getTenant(): Promise<TenantContext | null> {
  const h = await headers();
  return lookupTenantByHostname(
    hostnameFromHostHeader(h.get("x-forwarded-host") ?? h.get("host"))
  );
}
