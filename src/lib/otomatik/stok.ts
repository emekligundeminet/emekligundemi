/**
 * Stok kapak fotoğrafları: editör panelden yükler, otomatik hat kategoriye
 * göre rastgele seçip üstüne başlık + logo basar.
 * Depolama: article-images/<tenant>/stok/<kategori>--<benzersiz>.<uzantı>
 * (kategori "genel" ise her kategoriye düşebilir).
 */
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";

export const STOK_BUCKET = "article-images";
export const GENEL = "genel";

export type StokGorsel = { path: string; kategori: string; url: string; alt?: string };

/**
 * Tenant ayarlarını taze okuyup değiştirir. Uzun süren haber turu başta
 * okuduğu eski kopyayı yazarsa, arada panelden kaydedilen ayarlar silinirdi.
 */
export async function ayarlariGuncelle(
  tenantId: string,
  degistir: (settings: Record<string, unknown>) => void
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from("tenants").select("settings").eq("id", tenantId).single();
  if (error) throw new Error(error.message);
  const raw = data?.settings;
  const settings =
    raw && typeof raw === "object" && !Array.isArray(raw) ? { ...(raw as Record<string, unknown>) } : {};
  degistir(settings);
  const { error: upErr } = await supabase.from("tenants").update({ settings }).eq("id", tenantId);
  if (upErr) throw new Error(upErr.message);
}

/** settings.stokAltlar: { [path]: "görseli tarif eden cümle" } */
export function stokAltlari(settings: unknown): Record<string, string> {
  if (!settings || typeof settings !== "object") return {};
  const map = (settings as Record<string, unknown>).stokAltlar;
  if (!map || typeof map !== "object" || Array.isArray(map)) return {};
  return Object.fromEntries(
    Object.entries(map as Record<string, unknown>).filter(
      (e): e is [string, string] => typeof e[1] === "string"
    )
  );
}

export async function stokAltKaydet(tenantId: string, path: string, alt: string | null) {
  await ayarlariGuncelle(tenantId, (settings) => {
    const map = stokAltlari(settings);
    if (alt?.trim()) map[path] = alt.trim().slice(0, 125);
    else delete map[path];
    settings.stokAltlar = map;
  });
}

export function stokKlasoru(tenantId: string) {
  return `${tenantId}/stok`;
}

export async function stokListele(tenantId: string): Promise<StokGorsel[]> {
  const supabase = createSupabaseAdminClient();
  const klasor = stokKlasoru(tenantId);
  const { data, error } = await supabase.storage
    .from(STOK_BUCKET)
    .list(klasor, { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error(error.message);
  return (data ?? [])
    .filter((f) => f.id && f.name.includes("--"))
    .map((f) => {
      const path = `${klasor}/${f.name}`;
      return {
        path,
        kategori: f.name.split("--")[0],
        url: supabase.storage.from(STOK_BUCKET).getPublicUrl(path).data.publicUrl,
      };
    });
}

/**
 * Önce haberin kategorisinden, yoksa genel havuzdan seçer; son kullanılanları
 * atlar (havuz küçükse yine de bir şey döner). Senkron: paralel turda aynı
 * görsel iki habere düşmesin diye çağıran `son` listesine hemen ekler.
 */
export function stokSec(stoklar: StokGorsel[], kategori: string, son: string[]) {
  const havuz = stoklar.filter((s) => s.kategori === kategori);
  const aday = havuz.length > 0 ? havuz : stoklar.filter((s) => s.kategori === GENEL);
  if (aday.length === 0) return null;
  const taze = aday.filter((s) => !son.includes(s.path));
  const liste = taze.length > 0 ? taze : aday;
  const secilen = liste[Math.floor(Math.random() * liste.length)];
  son.push(secilen.path);
  return secilen;
}

/** Satori'ye verilecek data URL (yalnızca JPEG/PNG yüklenir). */
export async function stokVeri(path: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(STOK_BUCKET).download(path);
  if (error || !data) throw new Error(`Stok görsel indirilemedi: ${error?.message ?? path}`);
  const mime = path.endsWith(".png") ? "image/png" : "image/jpeg";
  const b64 = Buffer.from(await data.arrayBuffer()).toString("base64");
  return `data:${mime};base64,${b64}`;
}
