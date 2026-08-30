/** Oranlar koda gömülmez; çağıran admin parametresini verir. */

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function asString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function asMonthMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const n = asNumber(v);
    if (n != null) out[k] = n;
  }
  return out;
}

export function formatTry(n: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatYuzde(n: number, digits = 2) {
  return `%${n.toLocaleString("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

/** kümülatif = ∏(1 + ay/100) - 1 */
export function kumulatifTufe(aylik: Record<string, number>): number {
  const keys = Object.keys(aylik).sort();
  if (keys.length === 0) return 0;
  return keys.reduce((acc, k) => acc * (1 + aylik[k]! / 100), 1) - 1;
}

export type ZamTipi = "ssk_bagkur" | "memur";

export function hesaplaZam(opts: {
  mevcutMaas: number;
  tip: ZamTipi;
  zamSskBagkur: number;
  zamMemur: number;
  taban: number;
}) {
  const oranYuzde = opts.tip === "memur" ? opts.zamMemur : opts.zamSskBagkur;
  const oran = oranYuzde / 100;
  const yeniMaas = opts.mevcutMaas * (1 + oran);
  const odenen = Math.max(yeniMaas, opts.taban);
  return {
    oranYuzde,
    yeniMaas,
    odenen,
    fark: odenen - opts.mevcutMaas,
    tabanUygulandi: odenen > yeniMaas + 0.005,
  };
}

export function hesaplaAlimGucu(opts: {
  tutar: number;
  endeksGecis: number;
  endeksBugun: number;
}) {
  if (opts.endeksGecis <= 0 || opts.endeksBugun <= 0) return null;
  const bugunkuKarsilik = opts.tutar * (opts.endeksBugun / opts.endeksGecis);
  const kayipYuzde = (1 - opts.endeksGecis / opts.endeksBugun) * 100;
  return { bugunkuKarsilik, kayipYuzde };
}
