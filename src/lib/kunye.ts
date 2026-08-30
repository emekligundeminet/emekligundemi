import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { KUNYE_FIELDS, type KunyeKey, type KunyeVeri } from "@/types/kunye";

export const KUNYE_CACHE_TAG = "site-kunye";

export function parseKunyeVeri(raw: unknown): KunyeVeri {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const rec = raw as Record<string, unknown>;
  const out: KunyeVeri = {};
  for (const { key } of KUNYE_FIELDS) {
    const value = rec[key];
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

export function filledKunye(veri: KunyeVeri): { key: KunyeKey; label: string; value: string }[] {
  return KUNYE_FIELDS.flatMap(({ key, label }) => {
    const value = veri[key]?.trim() ?? "";
    return value ? [{ key, label, value }] : [];
  });
}

export function kunyeValue(veri: KunyeVeri, key: KunyeKey): string {
  return veri[key]?.trim() ?? "";
}

export const getKunye = unstable_cache(
  async (): Promise<KunyeVeri> => {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase
        .from("site_kunye")
        .select("veri")
        .eq("id", 1)
        .maybeSingle();
      if (error || !data) return {};
      return parseKunyeVeri(data.veri);
    } catch {
      return {};
    }
  },
  ["site-kunye"],
  { revalidate: 3600, tags: [KUNYE_CACHE_TAG] }
);
