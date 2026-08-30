import { PENSION_TOOL_PATH } from "@/lib/site";

/**
 * Hesaplama araçları. Yeni araç: buraya satır + `app/(site)/t/[tenantId]/araclar/...`.
 * Kart şeridi (haber altı manşet düzeni) bu listeden okur.
 */
export type CalcTool = {
  id: string;
  path: string;
  title: string;
  coverUrl?: string | null;
  coverAlt?: string | null;
};

export const CALC_TOOLS: CalcTool[] = [
  {
    id: "emekli-maasi",
    path: PENSION_TOOL_PATH,
    title: "Emekli Maaşı Hesaplama",
  },
  {
    id: "emekli-zam",
    path: "/araclar/emekli-zam-hesaplama",
    title: "Emekli Zam Hesaplama",
  },
  {
    id: "bayram-ikramiye",
    path: "/araclar/emekli-bayram-ikramiyesi",
    title: "Bayram İkramiyesi",
  },
  {
    id: "alim-gucu",
    path: "/araclar/alim-gucu-kaybi",
    title: "Alım Gücü Kaybı",
  },
];

export function calcToolsExcept(currentPath: string) {
  return CALC_TOOLS.filter((t) => t.path !== currentPath);
}
