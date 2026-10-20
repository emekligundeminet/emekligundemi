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

/**
 * Türkçe tutar girişi: "25.000", "25.000,50", "25000,5", "25 000 TL", "25000.50".
 * Eski parseTl tüm noktalama işaretlerini siliyordu; "25.000,50" → 2.500.050 oluyordu.
 */
export function parseTutar(girdi: string): number {
  let s = girdi.replace(/[^\d.,]/g, "");
  if (!s) return 0;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Yazarken binlik ayırıcı: "25000" → "25.000" (kuruş kısmı korunur). */
export function tutarYaz(girdi: string): string {
  const temiz = girdi.replace(/[^\d,]/g, "");
  const [tam, ...kesir] = temiz.split(",");
  const binli = (tam ?? "").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return kesir.length ? `${binli},${kesir.join("").slice(0, 2)}` : binli;
}

/** "2026-07" → 6 aylık dönemin ay anahtarları. */
export function donemAylari(baslangic: string, aySayisi = 6): string[] {
  const m = /^(\d{4})-(\d{2})$/.exec(baslangic.trim());
  if (!m) return [];
  let y = Number(m[1]);
  let a = Number(m[2]);
  const out: string[] = [];
  for (let i = 0; i < aySayisi; i++) {
    out.push(`${y}-${String(a).padStart(2, "0")}`);
    a += 1;
    if (a > 12) {
      a = 1;
      y += 1;
    }
  }
  return out;
}

export type DonemEnflasyonu = {
  /** Dönemin tamamı (açıklanan + tahmin) kümülatif, yüzde. */
  toplamYuzde: number;
  /** Yalnız açıklanan ayların kümülatifi, yüzde. */
  kesinlesenYuzde: number;
  aciklananAylar: string[];
  tahminAylar: string[];
  /** Kalan aylara uygulanan aylık tahmin, yüzde. */
  tahminAylik: number;
  kesin: boolean;
};

function oncekiAy(anahtar: string) {
  const [y, a] = anahtar.split("-").map(Number);
  return a === 1 ? `${y - 1}-12` : `${y}-${String(a - 1).padStart(2, "0")}`;
}

/**
 * SSK/Bağ-Kur zammı = dönemin 6 aylık kümülatif TÜFE'si.
 * TÜİK/SGK gibi ENDEKS oranından hesaplanır (son ay ÷ dönem öncesi ay − 1);
 * yuvarlanmış aylık yüzdeleri çarpmak 0,01 puan sapabilir (17,75 ≠ 17,76).
 * Endeks yoksa aylık yüzdeler kullanılır. Açıklanmamış aylara `tahminAylik`
 * (verilmezse açıklanan ayların ortalaması) uygulanır.
 */
export function donemEnflasyonu(opts: {
  aylar: string[];
  endeks?: Record<string, number>;
  aylik?: Record<string, number>;
  tahminAylik?: number | null;
}): DonemEnflasyonu {
  const endeks = opts.endeks ?? {};
  const aylik = opts.aylik ?? {};
  const baz = opts.aylar[0] ? endeks[oncekiAy(opts.aylar[0])] : undefined;
  const endeksVar = (k: string) => baz != null && endeks[k] != null;
  const aciklananAylar = opts.aylar.filter((k) => endeksVar(k) || aylik[k] != null);
  const tahminAylar = opts.aylar.filter((k) => !aciklananAylar.includes(k));

  let kesinlesen: number;
  let aylikYuzdeler: number[];
  if (aciklananAylar.length > 0 && aciklananAylar.every(endeksVar)) {
    const son = aciklananAylar[aciklananAylar.length - 1]!;
    kesinlesen = endeks[son]! / baz! - 1;
    aylikYuzdeler = aciklananAylar.map((k) => (endeks[k]! / endeks[oncekiAy(k)]! - 1) * 100);
  } else {
    const map = Object.fromEntries(aciklananAylar.map((k) => [k, aylik[k]!]));
    kesinlesen = kumulatifTufe(map);
    aylikYuzdeler = aciklananAylar.map((k) => aylik[k]!);
  }
  const ort = aylikYuzdeler.length ? aylikYuzdeler.reduce((t, x) => t + x, 0) / aylikYuzdeler.length : 0;
  const tahminAylik = opts.tahminAylik ?? Math.round(ort * 100) / 100;
  const toplam = (1 + kesinlesen) * (1 + tahminAylik / 100) ** tahminAylar.length - 1;
  return {
    toplamYuzde: toplam * 100,
    kesinlesenYuzde: kesinlesen * 100,
    aciklananAylar,
    tahminAylar,
    tahminAylik,
    kesin: tahminAylar.length === 0 && aciklananAylar.length > 0,
  };
}

/**
 * Memur emeklisi zammı = enflasyon farkı + yeni dönem toplu sözleşme zammı.
 * Enflasyon farkı = (1 + dönem TÜFE) / (1 + önceki dönem toplu sözleşme) − 1, negatifse 0.
 * Örn. Temmuz 2026: (1,1776 / 1,11) × 1,07 − 1 ≈ %13,52.
 */
export function memurZamYuzde(donemTufeYuzde: number, oncekiTsYuzde: number, yeniTsYuzde: number) {
  const fark = Math.max(0, (1 + donemTufeYuzde / 100) / (1 + oncekiTsYuzde / 100) - 1);
  return ((1 + fark) * (1 + yeniTsYuzde / 100) - 1) * 100;
}
