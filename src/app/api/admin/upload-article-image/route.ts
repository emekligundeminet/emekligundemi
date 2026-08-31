import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import {
  assertUploadCoverWidth,
  toWebp,
  webpSize,
} from "@/lib/cover-image";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";

const BUCKET = "article-images";
const MAX_BYTES = 4 * 1024 * 1024;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;

  try {
    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file") as File | null;
    if (!file || !file.size) {
      return NextResponse.json({ message: "Dosya gerekli." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Yalnızca görsel yükleyin." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: "Görsel çok büyük (en fazla 4 MB). Daha hafif bir JPEG deneyin." },
        { status: 400 }
      );
    }

    const kind = new URL(request.url).searchParams.get("kind");
    const isMark = kind === "mark";
    const input = Buffer.from(await file.arrayBuffer());
    if (!isMark) await assertUploadCoverWidth(input);
    const webpBuffer = await toWebp(input, isMark ? 512 : 1920);

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
        { status: 400 }
      );
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const outMeta = await webpSize(webpBuffer);
    const publicUrl = new URL(urlData.publicUrl);
    if (outMeta.width) publicUrl.searchParams.set("w", String(outMeta.width));
    if (outMeta.height) publicUrl.searchParams.set("h", String(outMeta.height));
    return NextResponse.json({
      url: publicUrl.toString(),
      path,
      width: outMeta.width ?? null,
      height: outMeta.height ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Görsel işlenemedi.";
    const status = /1200px|Kapak/.test(message) ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
