import "server-only";

import { unstable_cache } from "next/cache";
import { kunyeValue } from "@/lib/kunye";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { KunyeKey, KunyeVeri } from "@/types/kunye";
import type { YasalSayfa } from "@/types/yasal";

export const YASAL_CACHE_TAG = "yasal-sayfalar";

function mapRow(row: Record<string, unknown>): YasalSayfa {
  return {
    slug: String(row.slug),
    baslik: String(row.baslik),
    icerik_md: String(row.icerik_md ?? ""),
    guncelleme_tarihi: String(row.guncelleme_tarihi ?? "").slice(0, 10),
    yayinda: Boolean(row.yayinda),
  };
}

export const getYasalSayfa = (slug: string) =>
  unstable_cache(
    async (): Promise<YasalSayfa | null> => {
      try {
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase
          .from("yasal_sayfalar")
          .select("slug, baslik, icerik_md, guncelleme_tarihi, yayinda")
          .eq("slug", slug)
          .eq("yayinda", true)
          .maybeSingle();
        if (error || !data) return null;
        return mapRow(data as Record<string, unknown>);
      } catch {
        return null;
      }
    },
    ["yasal-sayfa", slug],
    { revalidate: 3600, tags: [YASAL_CACHE_TAG] }
  )();

export const listYayindaYasal = unstable_cache(
  async (): Promise<Pick<YasalSayfa, "slug" | "baslik" | "guncelleme_tarihi">[]> => {
    try {
      const supabase = createSupabaseAdminClient();
      const { data, error } = await supabase
        .from("yasal_sayfalar")
        .select("slug, baslik, guncelleme_tarihi")
        .eq("yayinda", true)
        .order("baslik");
      if (error) return [];
      return (data ?? []).map((row) => ({
        slug: String(row.slug),
        baslik: String(row.baslik),
        guncelleme_tarihi: String(row.guncelleme_tarihi ?? "").slice(0, 10),
      }));
    } catch {
      return [];
    }
  },
  ["yasal-sayfalar-list"],
  { revalidate: 3600, tags: [YASAL_CACHE_TAG] }
);

export function formatYasalTarih(isoDate: string) {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

const YASAL_TOKEN_TO_KUNYE: Record<string, KunyeKey> = {
  email: "eposta",
  yayin_sahibi: "yayin_sahibi",
  sorumlu_mudur: "sorumlu_mudur",
  yonetim_yeri: "yonetim_yeri",
};

/** {{email}} vb. — değer yoksa token olduğu gibi kalır. */
export function applyYasalTokens(markdown: string, kunye: KunyeVeri): string {
  return markdown.replace(
    /\{\{(email|yayin_sahibi|sorumlu_mudur|yonetim_yeri)\}\}/g,
    (full, name: string) => {
      const key = YASAL_TOKEN_TO_KUNYE[name];
      if (!key) return full;
      const value = kunyeValue(kunye, key);
      if (!value) return full;
      if (name === "email") return `[${value}](mailto:${value})`;
      return value;
    }
  );
}
