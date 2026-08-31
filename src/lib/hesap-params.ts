import "server-only";

import { unstable_cache } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { HesapParametre, HesapParamMap } from "@/types/hesap";

export type { HesapParametre, HesapParamMap };

export const HESAP_PARAMS_TAG = "hesap-parametreleri";
export const HESAP_REVALIDATE = 3600;

export const CALC_PATHS = [
  "/araclar/emekli-zam-hesaplama",
  "/araclar/emekli-bayram-ikramiyesi",
  "/araclar/alim-gucu-kaybi",
  "/araclar/emekli-maasi-hesaplama",
] as const;

async function loadParams(grup?: string): Promise<HesapParametre[]> {
  const supabase = createSupabaseAdminClient();
  let q = supabase
    .from("hesap_parametreleri")
    .select("id,anahtar,etiket,deger,birim,grup,aciklama,updated_at")
    .order("grup")
    .order("etiket");
  if (grup) q = q.eq("grup", grup);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as HesapParametre[];
}

export function cachedHesapParams(grup?: string) {
  return unstable_cache(
    async () => loadParams(grup),
    ["hesap-params", grup ?? "all"],
    { revalidate: HESAP_REVALIDATE, tags: [HESAP_PARAMS_TAG] }
  )();
}

/** { anahtar: deger } — sayfalar bunu kullanır. */
export async function getParams(grup?: string): Promise<HesapParamMap> {
  const rows = await cachedHesapParams(grup);
  const out: HesapParamMap = {};
  for (const row of rows) out[row.anahtar] = row.deger;
  return out;
}

export async function listHesapParams() {
  return loadParams();
}
