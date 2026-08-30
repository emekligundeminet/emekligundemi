/**
 * Emekli aylığı KATSAYI / ORAN / TUTAR tabloları.
 * Mantık `pension-estimate.ts` içinde; buraya yalnızca senin dolduracağın veriler.
 *
 * KURAL: Uydurma sayı yok. Bilinmeyen her değer null veya boş kayıt.
 * Tablo dolmadan araç tutar göstermez (`isPensionDataReady` / hesap dönüşü).
 */

export type SigortaTuru = "ssk" | "bagkur" | "memur";

/** 2000 öncesi bitiş (hariç değil: 31.12.1999 dahil). */
export const DONEM1_BITIS = { yil: 1999, ay: 12, gun: 31 } as const;
/** 2000–2008: 01.01.2000 – 30.09.2008 (5510: 1 Ekim 2008). */
export const DONEM2_BAS = { yil: 2000, ay: 1, gun: 1 } as const;
export const DONEM2_BITIS = { yil: 2008, ay: 9, gun: 30 } as const;
/** 2008 sonrası başlangıç. */
export const DONEM3_BAS = { yil: 2008, ay: 10, gun: 1 } as const;

/**
 * Alt sınır aylık (ek 19 / taban ödeme). Kök aylık değil.
 * [DOLDUR] Örn. Temmuz 2026 resmi tutar.
 */
export const altSinirAylik: number | null = null;

/**
 * Yıl Y kazancını Y+1 yılına taşıyan güncelleme katsayısı (çarpım).
 * Zincir: 2004 kazancı → k[2004]*k[2005]*…*k[hedefYil-1].
 *
 * [DOLDUR] Her yıla 0’dan büyük resmi katsayı yaz. 0 = henüz girilmedi;
 * 0’lı satırlarla araç tutar üretmez (uydurma katsayı yok).
 */
export const guncellemeKatsayilari: Record<number, number> = {
  2000: 0,
  2001: 0,
  2002: 0,
  2003: 0,
  2004: 0,
  2005: 0,
  2006: 0,
  2007: 0,
  2008: 0,
  2009: 0,
  2010: 0,
  2011: 0,
  2012: 0,
  2013: 0,
  2014: 0,
  2015: 0,
  2016: 0,
  2017: 0,
  2018: 0,
  2019: 0,
  2020: 0,
  2021: 0,
  2022: 0,
  2023: 0,
  2024: 0,
  2025: 0,
};

/**
 * Dönem 1 (2000 öncesi): gösterge dilimleri.
 * [DOLDUR] min–max aylık kazanç (veya prim gün bandı) → gösterge.
 */
export const gostergeTablosu2000Oncesi: { min: number; max: number; gosterge: number }[] = [];

/**
 * Dönem 1 gösterge katsayısı (gösterge ile çarpılan resmi katsayı).
 * [DOLDUR]
 */
export const gostergeKatsayisi2000Oncesi: number | null = null;

/**
 * Dönem 1 ABO (prim yılı / kademe → oran, 0–1).
 * [DOLDUR]
 */
export const abo2000Oncesi: { minPrimYil: number; abo: number }[] = [];

/**
 * Dönem 2 (2000–Eyl 2008): kademeli ABO.
 * [DOLDUR] min prim günü (bu dönemde) → ABO.
 */
export const abo2000_2008: { minPrimGun: number; abo: number }[] = [];

/**
 * Dönem 3 (Ekim 2008+): her 360 prim günü için ABO artışı.
 * 5510 md. 29 kamuoyunda %2; sen teyit et. Uydurma başka oran yok.
 */
export const abo2008SonrasiHer360Gun: number | null = 0.02;

/** Dönem 3 ABO tavanı. 5510’da %90 diye geçer; teyit et. */
export const abo2008SonrasiTavan: number | null = 0.9;

/**
 * Statü çarpanı. Fark yoksa 1 yaz; bilinmiyorsa null bırak (çarpan uygulanmaz,
 * uydurma 0.92 / 1.05 KULLANILMAZ).
 */
export const statuCarpani: Record<SigortaTuru, number | null> = {
  ssk: null,
  bagkur: null,
  memur: null,
};

export function guncellemeKatsayisi(yil: number): number | null {
  const k = guncellemeKatsayilari[yil];
  return typeof k === "number" && k > 0 ? k : null;
}

/** 2000’den (bu yıl − 1)’e kadar her yıl 0’dan büyük katsayı girilmiş mi. */
export function isGuncellemeTablosuTam(): boolean {
  const son = new Date().getFullYear() - 1;
  for (let y = 2000; y <= son; y++) {
    if (guncellemeKatsayisi(y) == null) return false;
  }
  return true;
}

/** Alt sınır + güncelleme zinciri hazır mı. Dönem tabloları hesapta ayrıca bakılır. */
export function isPensionDataReady(): boolean {
  return altSinirAylik != null && altSinirAylik > 0 && isGuncellemeTablosuTam();
}
