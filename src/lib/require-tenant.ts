import { getTenant } from "@/lib/tenant";

/** getTenant() sarmalayıcısı. tenant.ts'e dokunulmaz. */
export async function requireTenant() {
  const tenant = await getTenant();
  if (!tenant) {
    throw new Error("Tenant bulunamadı. Hostname domains tablosunda kayıtlı ve verified olmalı.");
  }
  return tenant;
}
