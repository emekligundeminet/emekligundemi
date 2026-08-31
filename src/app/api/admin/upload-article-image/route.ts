import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { assertUploadCoverWidth, measureSizeFromBuffer } from "@/lib/cover-image";
import { slugify } from "@/lib/slugify";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";

const BUCKET = "article-images";
const MAX_BYTES = 4 * 1024 * 1024;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function asPositiveInt(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.round(n) : null;
}

/** Google Görseller açıklayıcı dosya adını kullanır; slug'dan türet. */
function fileStem(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || !raw.trim()) return "gorsel";
  return slugify(raw).slice(0, 60).replace(/-+$/, "") || "gorsel";
}

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
    const clientW = asPositiveInt(formData?.get("width") ?? null);
    const clientH = asPositiveInt(formData?.get("height") ?? null);
    const input = Buffer.from(await file.arrayBuffer());
    const header = measureSizeFromBuffer(input);
    if (!isMark) assertUploadCoverWidth(input, clientW);

    const contentType = file.type || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";

    const supabase = createSupabaseAdminClient();
    const stem = fileStem(formData?.get("name") ?? null);
    const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const path = `${ctx.tenantId}/${stem}-${unique}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, input, {
      contentType,
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
    const width = header?.width ?? clientW ?? undefined;
    const height = header?.height ?? clientH ?? undefined;
    const publicUrl = new URL(urlData.publicUrl);
    if (width) publicUrl.searchParams.set("w", String(width));
    if (height) publicUrl.searchParams.set("h", String(height));
    return NextResponse.json({
      url: publicUrl.toString(),
      path,
      width: width ?? null,
      height: height ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Görsel işlenemedi.";
    const status = /1200px|Kapak/.test(message) ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
