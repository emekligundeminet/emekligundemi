import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/serverClient";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { getTenant } from "@/lib/tenant";
import type { TenantRole } from "@/types/tenant-role";

export type { TenantRole };

export type AdminOk = {
  ok: true;
  tenantId: string;
  userId: string;
  role: TenantRole;
  canPublish: boolean;
  canEditSettings: boolean;
};

export type AdminFail = { ok: false; status: 401 | 403 | 404; message: string };

export type AdminContext = AdminOk | AdminFail;

function isRole(value: string | null | undefined): value is TenantRole {
  return value === "owner" || value === "editor" || value === "author";
}

/**
 * Oturum + bu hostname'in tenant_members kaydı.
 * Taslak SELECT RLS'de yok; üyelik kontrolü service_role ile (yalnız bu sorgu).
 */
export async function getAdminContext(): Promise<AdminContext> {
  const tenant = await getTenant();
  if (!tenant) {
    return { ok: false, status: 404, message: "Tenant bulunamadı." };
  }

  const userClient = await createSupabaseServerClient();
  const { data: authData } = await userClient.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) {
    return { ok: false, status: 401, message: "Oturum gerekli." };
  }

  const admin = createSupabaseAdminClient();
  const { data: member } = await admin
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", tenant.tenant_id)
    .eq("user_id", userId)
    .maybeSingle();

  const role = (member as { role?: string } | null)?.role ?? null;
  if (!isRole(role)) {
    return { ok: false, status: 403, message: "Bu site için yetkiniz yok." };
  }

  return {
    ok: true,
    tenantId: tenant.tenant_id,
    userId,
    role,
    canPublish: role === "owner" || role === "editor",
    canEditSettings: role === "owner" || role === "editor",
  };
}

export async function requireAdminApi(): Promise<AdminOk | NextResponse> {
  const ctx = await getAdminContext();
  if (!ctx.ok) {
    return NextResponse.json({ message: ctx.message }, { status: ctx.status });
  }
  return ctx;
}

export function forbidIfCannotWrite(ctx: AdminOk) {
  if (ctx.role !== "owner" && ctx.role !== "editor" && ctx.role !== "author") {
    return NextResponse.json({ message: "Yetkisiz." }, { status: 403 });
  }
  return null;
}

export function forbidIfCannotPublish(ctx: AdminOk) {
  if (!ctx.canPublish) {
    return NextResponse.json(
      { message: "Yazar rolü yayınlayamaz." },
      { status: 403 }
    );
  }
  return null;
}

export function forbidIfCannotEditSettings(ctx: AdminOk) {
  if (!ctx.canEditSettings) {
    return NextResponse.json(
      { message: "Site ayarlarını yalnızca owner ve editor düzenleyebilir." },
      { status: 403 }
    );
  }
  return null;
}

export function isPublishStatus(status: string | undefined | null) {
  return status === "published";
}
