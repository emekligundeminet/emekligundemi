import type { CekilenHaber } from "@/lib/scrape";

export type AiTaslak = {
  haber: CekilenHaber;
  taslak: string;
  uyari?: string;
};

export async function gonderAi(haber: CekilenHaber): Promise<AiTaslak> {
  return {
    haber,
    taslak: haber.govde,
    uyari: "AI katmanı henüz yok. Ham gövde taslak olarak düştü.",
  };
}
