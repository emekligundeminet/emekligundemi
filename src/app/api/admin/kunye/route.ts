import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { forbidIfCannotEditSettings, requireAdminApi } from "@/lib/admin-auth";
import { KUNYE_CACHE_TAG, parseKunyeVeri } from "@/lib/kunye";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { KUNYE_FIELDS } from "@/types/kunye";
import { KURUMSAL_YASAL_SLUGS, yasalPath } from "@/types/yasal";

export const dynamic = "force-dynamic";

function pickVeri(raw: Record<string, unknown>) {
  const out: Record<string, string> = {};
  for (const { key } of KUNYE_FIELDS) {
    const value = raw[key];
    out[key] = typeof value === "string" ? value.trim() : "";
  }
  return out;
}

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_kunye")
    .select("veri, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({
    veri: parseKunyeVeri(data?.veri),
    updated_at: data?.updated_at ?? null,
  });
}

export async function PATCH(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotEditSettings(ctx);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const veri = pickVeri(body);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_kunye")
    .upsert({ id: 1, veri, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select("veri, updated_at")
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });

  revalidateTag(KUNYE_CACHE_TAG, "max");
  revalidatePath("/kunye");
  for (const slug of KURUMSAL_YASAL_SLUGS) revalidatePath(yasalPath(slug));

  return NextResponse.json({
    veri: parseKunyeVeri(data.veri),
    updated_at: data.updated_at,
  });
}
