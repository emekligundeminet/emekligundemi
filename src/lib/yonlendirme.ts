import "server-only";
import { unstable_cache } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";

/**
 * Eski haber adresi → yeni adres (301). `redirects` tablosu; publik SELECT
 * olmadığı için service role ile okunur. Yayınlanmış haberin adresi
 * değişince updateArticle kayıt ekler; haber sayfası bulunamazsa bakılır.
 */

export function yonlendirmeBul(tenantId: string, fromPath: string) {
  const tags = cacheTags(tenantId);
  return unstable_cache(
    async () => {
      const { data } = await createSupabaseAdminClient()
        .from("redirects")
        .select("to_path")
        .eq("tenant_id", tenantId)
        .eq("from_path", fromPath)
        .maybeSingle();
      return (data?.to_path as string | undefined) ?? null;
    },
    ["yonlendirme", tenantId, fromPath],
    { revalidate: 3600, tags: [tags.articles] }
  )();
}

/** from → to kaydı; zinciri kısaltır (A→B varken B→C gelirse A→C) ve döngüyü önler. */
export async function yonlendirmeEkle(tenantId: string, fromPath: string, toPath: string) {
  if (!fromPath || !toPath || fromPath === toPath) return;
  const sb = createSupabaseAdminClient();
  // Yeni adres daha önce eski adres olarak kayıtlıysa (geri dönüş) o kaydı sil.
  await sb.from("redirects").delete().eq("tenant_id", tenantId).eq("from_path", toPath);
  // Eski adrese giden önceki yönlendirmeleri doğrudan yeni adrese bağla.
  await sb.from("redirects").update({ to_path: toPath }).eq("tenant_id", tenantId).eq("to_path", fromPath);
  const { error } = await sb
    .from("redirects")
    .upsert({ tenant_id: tenantId, from_path: fromPath, to_path: toPath }, { onConflict: "tenant_id,from_path" });
  if (error) throw new Error(error.message);
}
