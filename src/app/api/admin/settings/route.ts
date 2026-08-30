import { NextResponse } from "next/server";
import { forbidIfCannotEditSettings, requireAdminApi } from "@/lib/admin-auth";
import { getTenant } from "@/lib/tenant";
import { updateTenantSettings } from "@/lib/store";
import { revalidateTenantContent } from "@/lib/revalidate-tenant";
import type { Json } from "@/types/db";

export const dynamic = "force-dynamic";

const KEYS = [
  "site_name",
  "logo_url",
  "description",
  "primary_color",
  "twitter",
  "facebook",
  "instagram",
  "whatsapp",
  "adsense_client",
  "adsense_slot",
] as const;

function asRecord(settings: Json): Record<string, unknown> {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return { ...(settings as Record<string, unknown>) };
  }
  return {};
}

function pickSettings(raw: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const key of KEYS) {
    const value = raw[key];
    if (typeof value === "string") {
      const t = value.trim();
      out[key] = t || null;
    }
  }
  return out;
}

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const tenant = await getTenant();
  if (!tenant || tenant.tenant_id !== ctx.tenantId) {
    return NextResponse.json({ message: "Tenant bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ settings: asRecord(tenant.settings) });
}

export async function PATCH(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotEditSettings(ctx);
  if (denied) return denied;
  const tenant = await getTenant();
  if (!tenant || tenant.tenant_id !== ctx.tenantId) {
    return NextResponse.json({ message: "Tenant bulunamadı." }, { status: 404 });
  }
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const merged = { ...asRecord(tenant.settings), ...pickSettings(body) };
  try {
    const row = await updateTenantSettings(ctx.tenantId, merged);
    revalidateTenantContent({ tenantId: ctx.tenantId });
    return NextResponse.json({ settings: row.settings });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
