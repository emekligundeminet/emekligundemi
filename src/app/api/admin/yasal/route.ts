import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { forbidIfCannotEditSettings, requireAdminApi } from "@/lib/admin-auth";
import { YASAL_CACHE_TAG } from "@/lib/yasal";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { yasalPath } from "@/types/yasal";

export const dynamic = "force-dynamic";

function revalidateYasal(slug: string) {
  revalidateTag(YASAL_CACHE_TAG, "max");
  revalidatePath(yasalPath(slug));
  if (slug === "cerez-politikasi") revalidatePath("/cerez-politikasi");
  if (slug === "gizlilik") revalidatePath("/gizlilik");
}

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("yasal_sayfalar")
    .select("slug, baslik, icerik_md, guncelleme_tarihi, yayinda")
    .order("baslik");
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotEditSettings(ctx);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    baslik?: string;
    icerik_md?: string;
    guncelleme_tarihi?: string;
    yayinda?: boolean;
  };
  const slug = body.slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "") ?? "";
  const baslik = body.baslik?.trim() ?? "";
  if (!slug || !baslik) {
    return NextResponse.json({ message: "slug ve başlık gerekli." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("yasal_sayfalar")
    .insert({
      slug,
      baslik,
      icerik_md: body.icerik_md ?? "",
      guncelleme_tarihi: body.guncelleme_tarihi || new Date().toISOString().slice(0, 10),
      yayinda: body.yayinda !== false,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  revalidateYasal(slug);
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotEditSettings(ctx);
  if (denied) return denied;

  const body = (await request.json().catch(() => ({}))) as {
    slug?: string;
    baslik?: string;
    icerik_md?: string;
    guncelleme_tarihi?: string;
    yayinda?: boolean;
  };
  const slug = body.slug?.trim();
  if (!slug) return NextResponse.json({ message: "slug gerekli." }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("yasal_sayfalar")
    .update({
      ...(body.baslik !== undefined ? { baslik: body.baslik.trim() } : {}),
      ...(body.icerik_md !== undefined ? { icerik_md: body.icerik_md } : {}),
      guncelleme_tarihi: body.guncelleme_tarihi || new Date().toISOString().slice(0, 10),
      ...(body.yayinda !== undefined ? { yayinda: body.yayinda } : {}),
    })
    .eq("slug", slug)
    .select()
    .single();
  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  revalidateYasal(slug);
  return NextResponse.json(data);
}
