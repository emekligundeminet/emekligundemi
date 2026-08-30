/**
 * Emekli aylığı MANTIĞI. Katsayı yok; hepsi `pension-data.ts`.
 *
 * Dönem günü: mümkünse kullanıcı girer (doğru). `dagitPrimGunleri` yalnızca
 * başlangıç+toplam ile takvim tahmini — kesintisiz çalışma varsayar.
 *
 * Birleştirme:
 *   ham = Σ (kısmi_i × gün_i / toplamGün)
 *   aylık = max(ham, altSinirAylik)   // alt sınır null ise sonuç üretilmez
 *
 * Tek “ortalama kazanç” bugünün TL’si sayılır → güncelleme zinciri uygulanmaz
 * (enflasyon iki kez yazılmasın). Zincir `guncelleKazanc` ile duruyor; yıllık
 * döküm bağlanınca dönem kazancına kazancYili verilir.
 */

import {
  abo2000Oncesi,
  abo2000_2008,
  abo2008SonrasiHer360Gun,
  abo2008SonrasiTavan,
  altSinirAylik,
  DONEM2_BAS,
  DONEM3_BAS,
  gostergeKatsayisi2000Oncesi,
  gostergeTablosu2000Oncesi,
  guncellemeKatsayisi,
  isGuncellemeTablosuTam,
  statuCarpani,
  type SigortaTuru,
} from "@/lib/pension-data";

export type { SigortaTuru };

export type DonemGunleri = { d1: number; d2: number; d3: number };

export type PensionEstimateInput = {
  startYear: number;
  startMonth: number;
  primGun: number;
  donemGunleri?: Partial<DonemGunleri>;
  ortalamaKazanc: number;
  /** Nominal kazancın yılı; boşsa tutar bugünün TL’si, zincir uygulanmaz. */
  kazancYili?: number;
  kazanc1?: number;
  kazanc2?: number;
  kazanc3?: number;
  tur: SigortaTuru;
};

export type DonemSonuc = {
  gun: number;
  kismi: number | null;
  gunOrani: number;
  katki: number | null;
  aboYuzde: number | null;
  eksik: string[];
};

export type PensionEstimateOk = {
  ok: true;
  aylik: number;
  altSiniraCekildi: boolean;
  toplamGun: number;
  donem1: DonemSonuc;
  donem2: DonemSonuc;
  donem3: DonemSonuc;
};

export type PensionEstimateFail = {
  ok: false;
  kod: "girdi" | "veri";
  mesaj: string;
  eksikler: string[];
};

export type PensionEstimate = PensionEstimateOk | PensionEstimateFail;

function gunFark(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / 86400000);
}

function tarih(y: number, m: number, d: number) {
  return new Date(y, m - 1, d);
}

export function dagitPrimGunleri(
  startYear: number,
  startMonth: number,
  toplam: number
): DonemGunleri {
  const bos: DonemGunleri = { d1: 0, d2: 0, d3: 0 };
  if (toplam < 1 || !startYear || !startMonth) return bos;

  const start = tarih(startYear, startMonth, 1);
  const now = new Date();
  const p1end = tarih(DONEM2_BAS.yil, DONEM2_BAS.ay, DONEM2_BAS.gun);
  const p3bas = tarih(DONEM3_BAS.yil, DONEM3_BAS.ay, DONEM3_BAS.gun);
  const c1 = gunFark(start, p1end);
  const c2 = gunFark(new Date(Math.max(start.getTime(), p1end.getTime())), p3bas);
  const c3 = gunFark(new Date(Math.max(start.getTime(), p3bas.getTime())), now);
  const cal = c1 + c2 + c3;
  if (cal < 1) {
    if (start < p1end) return { d1: toplam, d2: 0, d3: 0 };
    if (start < p3bas) return { d1: 0, d2: toplam, d3: 0 };
    return { d1: 0, d2: 0, d3: toplam };
  }
  const d1 = Math.round((toplam * c1) / cal);
  const d2 = Math.round((toplam * c2) / cal);
  const d3 = Math.max(0, toplam - d1 - d2);
  return { d1, d2, d3 };
}

/** Yıl Y tutarını hedef yıl başına katsayı çarpımıyla taşır. */
export function guncelleKazanc(
  tutar: number,
  kazancYili: number,
  hedefYil: number
): { deger: number } | { eksik: string } {
  if (hedefYil <= kazancYili) return { deger: tutar };
  let x = tutar;
  for (let y = kazancYili; y < hedefYil; y++) {
    const k = guncellemeKatsayisi(y);
    if (k == null) return { eksik: `guncellemeKatsayilari[${y}] boş` };
    x *= k;
  }
  return { deger: x };
}

function aboKademeGun(tablo: { minPrimGun: number; abo: number }[], gun: number): number | null {
  if (tablo.length === 0) return null;
  let abo: number | null = null;
  for (const row of [...tablo].sort((a, b) => a.minPrimGun - b.minPrimGun)) {
    if (gun >= row.minPrimGun) abo = row.abo;
  }
  return abo;
}

function aboKademeYil(tablo: { minPrimYil: number; abo: number }[], yil: number): number | null {
  if (tablo.length === 0) return null;
  let abo: number | null = null;
  for (const row of [...tablo].sort((a, b) => a.minPrimYil - b.minPrimYil)) {
    if (yil >= row.minPrimYil) abo = row.abo;
  }
  return abo;
}

function gostergeBul(kazanc: number): number | null {
  if (gostergeTablosu2000Oncesi.length === 0) return null;
  return gostergeTablosu2000Oncesi.find((r) => kazanc >= r.min && kazanc <= r.max)?.gosterge ?? null;
}

function statuCarpan(tur: SigortaTuru): number {
  const c = statuCarpani[tur];
  return typeof c === "number" && c > 0 ? c : 1;
}

type Parca = { kismi: number; abo: number } | { eksikler: string[] };

function donem1(gun: number, kazanc: number): Parca {
  const eksikler: string[] = [];
  if (gostergeTablosu2000Oncesi.length === 0) eksikler.push("gostergeTablosu2000Oncesi");
  if (gostergeKatsayisi2000Oncesi == null || gostergeKatsayisi2000Oncesi <= 0) {
    eksikler.push("gostergeKatsayisi2000Oncesi");
  }
  const abo = aboKademeYil(abo2000Oncesi, gun / 360);
  if (abo == null) eksikler.push("abo2000Oncesi");
  const gosterge = gostergeBul(kazanc);
  if (gosterge == null) eksikler.push("gosterge dilimi");
  if (eksikler.length || abo == null || gosterge == null || gostergeKatsayisi2000Oncesi == null) {
    return { eksikler };
  }
  return { kismi: gosterge * gostergeKatsayisi2000Oncesi * abo, abo };
}

function donem2(gun: number, kazanc: number): Parca {
  const abo = aboKademeGun(abo2000_2008, gun);
  if (abo == null) return { eksikler: ["abo2000_2008"] };
  return { kismi: kazanc * abo, abo };
}

function donem3(gun: number, kazanc: number): Parca {
  const eksikler: string[] = [];
  if (abo2008SonrasiHer360Gun == null) eksikler.push("abo2008SonrasiHer360Gun");
  if (abo2008SonrasiTavan == null) eksikler.push("abo2008SonrasiTavan");
  if (eksikler.length || abo2008SonrasiHer360Gun == null || abo2008SonrasiTavan == null) {
    return { eksikler };
  }
  const abo = Math.min(abo2008SonrasiTavan, (gun / 360) * abo2008SonrasiHer360Gun);
  return { kismi: kazanc * abo, abo };
}

function paket(gun: number, toplam: number, parca: Parca): DonemSonuc {
  const gunOrani = toplam > 0 ? gun / toplam : 0;
  if (gun < 1) {
    return { gun: 0, kismi: 0, gunOrani: 0, katki: 0, aboYuzde: null, eksik: [] };
  }
  if ("eksikler" in parca) {
    return { gun, kismi: null, gunOrani, katki: null, aboYuzde: null, eksik: parca.eksikler };
  }
  return {
    gun,
    kismi: parca.kismi,
    gunOrani,
    katki: parca.kismi * gunOrani,
    aboYuzde: Math.round(parca.abo * 1000) / 10,
    eksik: [],
  };
}

export function estimatePension(input: PensionEstimateInput): PensionEstimate {
  const { startYear, startMonth, primGun, ortalamaKazanc, tur } = input;
  if (!startYear || !startMonth || primGun < 1 || ortalamaKazanc < 1) {
    return {
      ok: false,
      kod: "girdi",
      mesaj: "Başlangıç tarihi, prim günü ve kazanç gerekli.",
      eksikler: [],
    };
  }

  const tahmin = dagitPrimGunleri(startYear, startMonth, primGun);
  const d1 = Math.max(0, input.donemGunleri?.d1 ?? tahmin.d1);
  const d2 = Math.max(0, input.donemGunleri?.d2 ?? tahmin.d2);
  const d3 = Math.max(0, input.donemGunleri?.d3 ?? tahmin.d3);
  const toplamGun = d1 + d2 + d3;
  if (toplamGun < 1) {
    return { ok: false, kod: "girdi", mesaj: "Dönem prim günleri toplamı 0.", eksikler: [] };
  }

  const hedefYil = new Date().getFullYear();
  const k1ham = input.kazanc1 && input.kazanc1 > 0 ? input.kazanc1 : ortalamaKazanc;
  const k2ham = input.kazanc2 && input.kazanc2 > 0 ? input.kazanc2 : ortalamaKazanc;
  const k3ham = input.kazanc3 && input.kazanc3 > 0 ? input.kazanc3 : ortalamaKazanc;

  const guncelleGirdi = (tutar: number): { deger: number } | { eksik: string } => {
    const y = input.kazancYili;
    if (!y || y >= hedefYil) return { deger: tutar };
    return guncelleKazanc(tutar, y, hedefYil);
  };

  const g1 = guncelleGirdi(k1ham);
  const g2 = guncelleGirdi(k2ham);
  const g3 = guncelleGirdi(k3ham);
  const guncelleEksik = [g1, g2, g3]
    .filter((g): g is { eksik: string } => "eksik" in g)
    .map((g) => g.eksik);

  const k1 = "deger" in g1 ? g1.deger : k1ham;
  const k2 = "deger" in g2 ? g2.deger : k2ham;
  const k3 = "deger" in g3 ? g3.deger : k3ham;

  const donem1s = paket(d1, toplamGun, donem1(d1, k1));
  const donem2s = paket(d2, toplamGun, donem2(d2, k2));
  const donem3s = paket(d3, toplamGun, donem3(d3, k3));

  const eksikler = [...donem1s.eksik, ...donem2s.eksik, ...donem3s.eksik, ...guncelleEksik];
  if (altSinirAylik == null || altSinirAylik <= 0) eksikler.push("altSinirAylik");
  if (!isGuncellemeTablosuTam()) eksikler.push("guncellemeKatsayilari");

  if (eksikler.length > 0) {
    return {
      ok: false,
      kod: "veri",
      mesaj: "Katsayı tabloları henüz doldurulmadığı için tutar üretilemiyor.",
      eksikler: [...new Set(eksikler)],
    };
  }

  const ham = ((donem1s.katki ?? 0) + (donem2s.katki ?? 0) + (donem3s.katki ?? 0)) * statuCarpan(tur);
  const taban = altSinirAylik as number;
  const altSiniraCekildi = ham < taban;

  return {
    ok: true,
    aylik: Math.round(altSiniraCekildi ? taban : ham),
    altSiniraCekildi,
    toplamGun,
    donem1: donem1s,
    donem2: donem2s,
    donem3: donem3s,
  };
}
