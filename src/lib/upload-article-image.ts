export async function uploadArticleImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload-article-image", {
    method: "POST",
    body: form,
  });
  const data = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok || typeof data.url !== "string") {
    throw new Error(data.message ?? "Yükleme başarısız.");
  }
  return data.url;
}
