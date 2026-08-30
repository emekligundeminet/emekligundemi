import { NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdminApi } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";

const BUCKET = "article-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file") as File | null;
  if (!file || !file.size) {
    return NextResponse.json({ message: "Dosya gerekli." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ message: "Yalnızca görsel yükleyin." }, { status: 400 });
  }

  const input = Buffer.from(await file.arrayBuffer());
  let webpBuffer: Buffer;
  try {
    webpBuffer = await sharp(input)
      .rotate()
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json({ message: "Görsel işlenemedi." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const path = `${ctx.tenantId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, webpBuffer, {
    contentType: "image/webp",
    upsert: true,
  });

  if (error) {
    const missing =
      error.message.includes("Bucket not found") ||
      error.message.includes("not found") ||
      error.message.toLowerCase().includes("bucket");
    return NextResponse.json(
      {
        message: missing
          ? "Supabase Storage’da public ‘article-images’ bucket’ı yok. Dashboard → Storage → New bucket: ad article-images, Public işaretli."
          : error.message,
      },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: urlData.publicUrl, path });
}
