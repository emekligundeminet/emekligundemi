const MAX_W = 1920;

/** Her görseli JPEG'e çevirip küçültür (Vercel gövde sınırı + kapak üretici JPEG/PNG okur). */
export async function jpegeCevir(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_W / bmp.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("Görsel işlenemedi.");
  return new File([blob], "stok.jpg", { type: "image/jpeg" });
}

/** Stok fotoğrafı yükler (panel sayfası ve haber formundaki seçici ortak). */
export async function stokYukle(file: File, kategori: string) {
  const form = new FormData();
  form.append("file", await jpegeCevir(file));
  form.append("kategori", kategori);
  const res = await fetch("/api/admin/stok", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { path?: string; message?: string };
  if (!res.ok || !data.path) throw new Error(data.message ?? "Yüklenemedi.");
  return data.path;
}
