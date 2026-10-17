import { NextResponse } from "next/server";
import { forbidIfCannotWrite, requireAdminApi } from "@/lib/admin-auth";
import { DISCOVER_COVER_MIN_WIDTH, measureSizeFromBuffer } from "@/lib/cover-image";
import { slugify } from "@/lib/slugify";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { GENEL, STOK_BUCKET, stokKlasoru, stokListele } from "@/lib/otomatik/stok";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 4 * 1024 * 1024;

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  try {
    return NextResponse.json(await stokListele(ctx.tenantId));
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Liste alınamadı." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;

  const form = await request.formData().catch(() => null);
  const file = form?.get("file") as File | null;
  const kategori = slugify(String(form?.get("kategori") ?? GENEL)) || GENEL;
  if (!file || !file.size) {
    return NextResponse.json({ message: "Dosya gerekli." }, { status: 400 });
  }
  // Kapak üretici (Satori) yalnızca JPEG/PNG okur; tarayıcı zaten JPEG'e çevirir.
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    return NextResponse.json({ message: "Yalnızca JPEG veya PNG yükleyin." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: "Görsel en fazla 4 MB olabilir." }, { status: 400 });
  }
  const input = Buffer.from(await file.arrayBuffer());
  const size = measureSizeFromBuffer(input);
  if (size && size.width < DISCOVER_COVER_MIN_WIDTH) {
    return NextResponse.json(
      { message: `Görsel en az ${DISCOVER_COVER_MIN_WIDTH}px genişlikte olmalı (bu ${size.width}px).` },
      { status: 400 }
    );
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const path = `${stokKlasoru(ctx.tenantId)}/${kategori}--${unique}.${ext}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(STOK_BUCKET)
    .upload(path, input, { contentType: file.type, upsert: false });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ path });
}

export async function DELETE(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  const path = body?.path ?? "";
  if (!path.startsWith(`${stokKlasoru(ctx.tenantId)}/`) || path.includes("..")) {
    return NextResponse.json({ message: "Geçersiz görsel." }, { status: 400 });
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(STOK_BUCKET).remove([path]);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
