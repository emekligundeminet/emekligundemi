import { NextResponse } from "next/server";
import { forbidIfCannotEditSettings, requireAdminApi } from "@/lib/admin-auth";
import { listHesapParams } from "@/lib/hesap-params";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { revalidateHesapPaths } from "@/lib/revalidate-hesap";
import type { Json } from "@/types/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const rows = await listHesapParams();
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotEditSettings(ctx);
  if (denied) return denied;

  const body = (await request.json()) as {
    anahtar?: string;
    etiket?: string;
    deger?: Json;
    birim?: string | null;
    grup?: string;
    aciklama?: string | null;
  };
  if (!body.anahtar?.trim() || !body.etiket?.trim() || !body.grup?.trim() || body.deger === undefined) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("hesap_parametreleri")
    .insert({
      anahtar: body.anahtar.trim(),
      etiket: body.etiket.trim(),
      deger: body.deger,
      birim: body.birim?.trim() || null,
      grup: body.grup.trim(),
      aciklama: body.aciklama?.trim() || null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  revalidateHesapPaths();
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotEditSettings(ctx);
  if (denied) return denied;

  const body = (await request.json()) as {
    id?: string;
    etiket?: string;
    deger?: Json;
    birim?: string | null;
    aciklama?: string | null;
  };
  if (!body.id) return NextResponse.json({ message: "id gerekli." }, { status: 400 });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("hesap_parametreleri")
    .update({
      ...(body.etiket !== undefined ? { etiket: body.etiket } : {}),
      ...(body.deger !== undefined ? { deger: body.deger } : {}),
      ...(body.birim !== undefined ? { birim: body.birim } : {}),
      ...(body.aciklama !== undefined ? { aciklama: body.aciklama } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .select()
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  revalidateHesapPaths();
  return NextResponse.json(data);
}
