/** Vercel gövde sınırı ~4.5MB; büyük telefon fotoğrafını tarayıcıda küçült. */
async function shrinkImageFile(
  file: File,
  maxW: number
): Promise<{ file: File; width?: number; height?: number }> {
  if (typeof createImageBitmap !== "function") return { file };
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxW / bmp.width);
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const smallEnough = file.size <= 2_400_000 && scale === 1;
    if (smallEnough && (file.type === "image/jpeg" || file.type === "image/webp")) {
      bmp.close();
      return { file, width: w, height: h };
    }
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return { file, width: bmp.width, height: bmp.height };
    }
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82)
    );
    if (!blob) return { file, width: w, height: h };
    return {
      file: new File([blob], "image.jpg", { type: "image/jpeg" }),
      width: w,
      height: h,
    };
  } catch {
    return { file };
  }
}

export async function uploadArticleImage(
  file: File,
  kind: "cover" | "mark" = "cover"
): Promise<string> {
  const prepared = await shrinkImageFile(file, kind === "mark" ? 512 : 1920);
  const form = new FormData();
  form.append("file", prepared.file);
  if (prepared.width) form.append("width", String(prepared.width));
  if (prepared.height) form.append("height", String(prepared.height));
  const qs = kind === "mark" ? "?kind=mark" : "";
  const res = await fetch(`/api/admin/upload-article-image${qs}`, {
    method: "POST",
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok || typeof data.url !== "string") {
    throw new Error(data.message ?? "Yükleme başarısız.");
  }
  return data.url;
}
