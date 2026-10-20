/**
 * "Ne zaman emekli olurum?" — yaşlılık aylığı şartları ve tahmini tarih.
 * Kaynaklar (mevzuat.gov.tr metinleri):
 * - 506 s. K. geçici 81 (B): 8/9/1999 öncesi 4/a kademeli prim günü, (C): 15 yıl 3600 gün
 * - 1479 s. K. geçici 10: 8/9/1999 öncesi 4/b 20/25 tam yıl prim
 * - 5434 s. K. geçici 205: 8/9/1999 öncesi 4/c 20/25 yıl hizmet
 * - 5510 s. K. geçici 95 (7438, EYT): yukarıdaki üç hükümde yaş şartı aranmaz
 * - 5510 s. K. geçici 9: 8/9/1999–30/4/2008 girişleri
 * - 5510 s. K. md. 28: 1/5/2008 sonrası girişler, 2036–2048 yaş kademesi
 * Tarihler UTC gün olarak tutulur ("YYYY-MM-DD").
 */

export type Statu = "4a" | "4b" | "4c";
export type Cinsiyet = "kadin" | "erkek";
export type Donem = "eyt" | "4447" | "5510";

export type Sart = {
  ad: string;
  /** Şartın sağlandığı ya da sağlanacağı gün; hesaplanamıyorsa null. */
  tarih: string | null;
};

export type Yol = {
  ad: string;
  sartlar: Sart[];
  /** Tüm şartların sağlandığı gün (en geç şart). */
  tarih: string | null;
};

export type EmeklilikSonucu = {
  donem: Donem;
  gerekliGun: number;
  yollar: Yol[];
  /** En erken tarihli yol. */
  enErken: Yol | null;
  uyarilar: string[];
};

const GUN_MS = 86_400_000;

export function tarihOku(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.getUTCMonth() === Number(m[2]) - 1 ? d : null;
}

export function tarihYaz(d: Date) {
  return d.toISOString().slice(0, 10);
}

function ekle(d: Date, yil: number, ay = 0, gun = 0) {
  const y = new Date(Date.UTC(d.getUTCFullYear() + yil, d.getUTCMonth() + ay, 1));
  // Ay sonu taşmasın: 29 Şubat + 1 yıl → 28 Şubat.
  const sonGun = new Date(Date.UTC(y.getUTCFullYear(), y.getUTCMonth() + 1, 0)).getUTCDate();
  y.setUTCDate(Math.min(d.getUTCDate(), sonGun));
  return new Date(y.getTime() + gun * GUN_MS);
}

function enGec(tarihler: (Date | null)[]): Date | null {
  if (tarihler.some((t) => t == null)) return null;
  return new Date(Math.max(...(tarihler as Date[]).map((t) => t.getTime())));
}

const EYT_SINIR = tarihOku("1999-09-08")!;
const DONEM_5510 = tarihOku("2008-05-01")!;

export function donemBul(giris: Date): Donem {
  if (giris.getTime() <= EYT_SINIR.getTime()) return "eyt";
  if (giris.getTime() < DONEM_5510.getTime()) return "4447";
  return "5510";
}

/** 506 geçici 81 (B): 23/5/2002'deki sigortalılık süresine göre prim günü. [yıl, ay, gün, prim günü] */
const KADEME: Record<Cinsiyet, [number, number, number, number][]> = {
  kadin: [
    [17, 0, 0, 5000], [16, 0, 0, 5075], [15, 0, 0, 5150], [14, 0, 0, 5225],
    [13, 0, 0, 5300], [12, 0, 0, 5375], [11, 0, 0, 5450], [10, 0, 0, 5525],
    [9, 0, 0, 5600], [8, 0, 0, 5675], [7, 0, 0, 5750], [6, 0, 0, 5825],
    [5, 0, 0, 5900], [4, 0, 0, 5975], [3, 0, 0, 5975], [2, 8, 15, 5975],
  ],
  erkek: [
    [21, 6, 0, 5000], [20, 0, 0, 5075], [18, 6, 0, 5150], [17, 0, 0, 5225],
    [15, 6, 0, 5300], [14, 0, 0, 5375], [12, 6, 0, 5450], [11, 0, 0, 5525],
    [9, 6, 0, 5600], [8, 0, 0, 5675], [6, 6, 0, 5750], [5, 0, 0, 5825],
    [3, 6, 0, 5900], [2, 8, 15, 5975],
  ],
};
const KADEME_TARIHI = tarihOku("2002-05-23")!;

export function kademeliPrimGunu(giris: Date, cinsiyet: Cinsiyet): number {
  for (const [y, a, g, gun] of KADEME[cinsiyet]) {
    // Süre ≥ eşik  ⇔  giriş ≤ 23/5/2002 − eşik
    if (giris.getTime() <= ekle(KADEME_TARIHI, -y, -a, -g).getTime()) return gun;
  }
  return 5975;
}

/** 5510 md. 28: prim günü şartının tamamlandığı tarihe göre yaş. */
export function yas5510(tamamlanma: Date, cinsiyet: Cinsiyet): number {
  const y = tamamlanma.getUTCFullYear();
  if (y < 2036) return cinsiyet === "kadin" ? 58 : 60;
  if (y >= 2048) return 65;
  const adim = Math.floor((y - 2036) / 2) + 1; // 2036-37 → 1, … 2046-47 → 6
  return Math.min(65, (cinsiyet === "kadin" ? 58 : 60) + adim);
}

/** 506 geçici 81 (C): 15 yıl + 3600 gün şartlarının tamamlandığı tarihe göre yaş. */
function yas15Yil(tamamlanma: Date, cinsiyet: Cinsiyet): number {
  const t = tamamlanma.getTime();
  const sinir = (s: string) => tarihOku(s)!.getTime();
  const k = cinsiyet === "kadin";
  if (t <= sinir("2002-05-23")) return k ? 50 : 55;
  if (t <= sinir("2005-05-23")) return k ? 52 : 56;
  if (t <= sinir("2008-05-23")) return k ? 54 : 57;
  if (t <= sinir("2011-05-23")) return k ? 56 : 58;
  if (t <= sinir("2014-05-23")) return k ? 58 : 59;
  return k ? 58 : 60;
}

export type EmeklilikGirdi = {
  statu: Statu;
  cinsiyet: Cinsiyet;
  dogum: string;
  giris: string;
  primGun: number;
  /** Bundan sonra yılda ödenecek prim günü (tam çalışma 360). */
  yillikGun: number;
  bugun: string;
};

export function emeklilikHesapla(g: EmeklilikGirdi): EmeklilikSonucu | null {
  const dogum = tarihOku(g.dogum);
  const giris = tarihOku(g.giris);
  const bugun = tarihOku(g.bugun);
  if (!dogum || !giris || !bugun || giris < dogum || giris > bugun) return null;

  const k = g.cinsiyet === "kadin";
  const donem = donemBul(giris);
  const mevcut = Math.max(0, Math.floor(g.primGun));
  const yillik = Math.max(0, Math.min(360, g.yillikGun));

  /** Prim günü hedefine ulaşılan gün (bugünden itibaren yıllık tempoyla). */
  const primTarihi = (hedef: number): Date | null => {
    if (mevcut >= hedef) return bugun;
    if (yillik <= 0) return null;
    const yil = (hedef - mevcut) / yillik;
    return new Date(bugun.getTime() + Math.ceil(yil * 365.25) * GUN_MS);
  };
  const gunSarti = (hedef: number): Sart => ({
    ad: `${hedef.toLocaleString("tr-TR")} prim günü`,
    tarih: yaz(primTarihi(hedef)),
  });
  const yasSarti = (yas: number): Sart => ({ ad: `${yas} yaş`, tarih: tarihYaz(ekle(dogum, yas)) });
  const sureSarti = (yil: number): Sart => ({
    ad: `${yil} yıl sigortalılık süresi`,
    tarih: tarihYaz(ekle(giris, yil)),
  });
  const yol = (ad: string, sartlar: Sart[]): Yol => ({
    ad,
    sartlar,
    tarih: yaz(enGec(sartlar.map((s) => (s.tarih ? tarihOku(s.tarih) : null)))),
  });

  const yollar: Yol[] = [];
  let gerekliGun: number;

  if (donem === "eyt") {
    if (g.statu === "4a") {
      gerekliGun = kademeliPrimGunu(giris, g.cinsiyet);
      yollar.push(yol("Normal emeklilik (EYT, yaş şartı yok)", [sureSarti(k ? 20 : 25), gunSarti(gerekliGun)]));
      // 506 geçici 81 (C): 15 yıl + 3600 gün, yaş tamamlama tarihine göre.
      const t = enGec([ekle(giris, 15), primTarihi(3600)]);
      const yas = t ? yas15Yil(t, g.cinsiyet) : k ? 58 : 60;
      yollar.push(yol("Yaştan emeklilik (15 yıl, 3600 gün)", [sureSarti(15), gunSarti(3600), yasSarti(yas)]));
    } else {
      gerekliGun = k ? 7200 : 9000;
      const ad = g.statu === "4b" ? `${k ? 20 : 25} tam yıl prim` : `${k ? 20 : 25} yıl hizmet`;
      yollar.push(yol(`Normal emeklilik (EYT, yaş şartı yok)`, [{ ...gunSarti(gerekliGun), ad }]));
    }
  } else if (donem === "4447") {
    const yas = k ? 58 : 60;
    if (g.statu === "4a") {
      gerekliGun = 7000;
      yollar.push(yol("Normal emeklilik", [yasSarti(yas), gunSarti(7000)]));
      yollar.push(yol("Kısmi emeklilik (25 yıl, 4500 gün)", [yasSarti(yas), sureSarti(25), gunSarti(4500)]));
    } else {
      gerekliGun = 9000;
      yollar.push(yol("Normal emeklilik", [yasSarti(yas), gunSarti(9000)]));
      const kismiYas = g.statu === "4b" ? (k ? 60 : 62) : 61;
      yollar.push(yol("Kısmi emeklilik (15 tam yıl)", [yasSarti(kismiYas), gunSarti(5400)]));
    }
  } else {
    gerekliGun = g.statu === "4a" ? 7200 : 9000;
    const t = primTarihi(gerekliGun);
    yollar.push(yol("Normal emeklilik", [gunSarti(gerekliGun), yasSarti(yas5510(t ?? bugun, g.cinsiyet))]));
    const t5400 = primTarihi(5400);
    const kismiYas = Math.min(65, yas5510(t5400 ?? bugun, g.cinsiyet) + 3);
    yollar.push(yol("Yaştan emeklilik (5400 gün)", [gunSarti(5400), yasSarti(kismiYas)]));
  }

  const tarihli = yollar.filter((y) => y.tarih);
  const enErken = tarihli.length
    ? tarihli.reduce((a, b) => (a.tarih! <= b.tarih! ? a : b))
    : null;

  const uyarilar: string[] = [];
  if (ekle(dogum, 18) > giris) {
    uyarilar.push(
      "18 yaşından önce sigortalı olmuşsunuz. Bazı durumlarda sigortalılık süresi 18 yaşından başlatılır; tarihiniz değişebilir."
    );
  }
  if (yillik <= 0 && mevcut < gerekliGun) {
    uyarilar.push("Prim ödemeye devam etmezseniz prim günü şartı tamamlanmaz.");
  }

  return { donem, gerekliGun, yollar, enErken, uyarilar };
}

function yaz(d: Date | null) {
  return d ? tarihYaz(d) : null;
}
