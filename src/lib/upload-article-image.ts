export async function uploadArticleImage(
  file: File,
  kind: "cover" | "mark" = "cover"
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
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
