import assert from "node:assert/strict";
import test from "node:test";
import { donemBul, emeklilikHesapla, kademeliPrimGunu, tarihOku, yas5510 } from "./emeklilik-tarihi";

const t = (s: string) => tarihOku(s)!;

test("dönem sınırları: 8/9/1999 dahil EYT, 1/5/2008 ve sonrası 5510", () => {
  assert.equal(donemBul(t("1999-09-08")), "eyt");
  assert.equal(donemBul(t("1999-09-09")), "4447");
  assert.equal(donemBul(t("2008-04-30")), "4447");
  assert.equal(donemBul(t("2008-05-01")), "5510");
});

test("506 geçici 81 (B) kademeleri", () => {
  // 23/5/2002'de 18+ yıl → 5000
  assert.equal(kademeliPrimGunu(t("1980-01-01"), "kadin"), 5000);
  // Kadın 15–16 yıl → 5150
  assert.equal(kademeliPrimGunu(t("1986-12-01"), "kadin"), 5150);
  // Erkek 20 yıl–21 yıl 6 ay → 5075
  assert.equal(kademeliPrimGunu(t("1981-06-01"), "erkek"), 5075);
  // Erkek 21 yıl 6 ay (dahil) → 5000
  assert.equal(kademeliPrimGunu(t("1980-11-23"), "erkek"), 5000);
  // Son kademe 5975
  assert.equal(kademeliPrimGunu(t("1999-09-01"), "kadin"), 5975);
  assert.equal(kademeliPrimGunu(t("1999-09-08"), "erkek"), 5975);
});

test("5510 md. 28 yaş kademesi prim tamamlama yılına göre", () => {
  assert.equal(yas5510(t("2035-12-31"), "kadin"), 58);
  assert.equal(yas5510(t("2036-01-01"), "kadin"), 59);
  assert.equal(yas5510(t("2037-06-01"), "erkek"), 61);
  assert.equal(yas5510(t("2044-01-01"), "erkek"), 65);
  assert.equal(yas5510(t("2046-01-01"), "kadin"), 64);
  assert.equal(yas5510(t("2048-01-01"), "kadin"), 65);
});

test("EYT kadın: süre ve prim günü tamamsa bugün emekli olabilir", () => {
  const r = emeklilikHesapla({
    statu: "4a", cinsiyet: "kadin", dogum: "1975-03-10", giris: "1995-06-01",
    primGun: 6000, yillikGun: 360, bugun: "2026-10-20",
  })!;
  assert.equal(r.donem, "eyt");
  // 23/5/2002'de 6 yıl 11 ay → 5825 gün; 20 yıl 2015'te doldu.
  assert.equal(r.gerekliGun, 5825);
  assert.equal(r.enErken?.tarih, "2026-10-20");
});

test("4447 dönemi erkek: 60 yaş ve 7000 gün; yıllık 360 günle ilerler", () => {
  const r = emeklilikHesapla({
    statu: "4a", cinsiyet: "erkek", dogum: "1980-01-15", giris: "2003-02-01",
    primGun: 6280, yillikGun: 360, bugun: "2026-10-20",
  })!;
  assert.equal(r.donem, "4447");
  const normal = r.yollar[0];
  // 720 gün eksik → 2 yıl sonra; yaş 60 → 2040-01-15 belirleyici.
  assert.equal(normal.sartlar[1].tarih, "2028-10-20");
  assert.equal(normal.tarih, "2040-01-15");
});

test("5510 dönemi: yaş, prim tamamlama yılındaki kademeye göre", () => {
  const r = emeklilikHesapla({
    statu: "4a", cinsiyet: "kadin", dogum: "1990-05-05", giris: "2010-03-01",
    primGun: 3600, yillikGun: 360, bugun: "2026-10-20",
  })!;
  const normal = r.yollar[0];
  // 3600 gün eksik → 10 yıl → 2036 → kadın 59 yaş.
  assert.equal(normal.sartlar[0].tarih?.slice(0, 4), "2036");
  assert.equal(normal.sartlar[1].ad, "59 yaş");
  assert.equal(normal.tarih, "2049-05-05");
});

test("prim ödenmezse tarih çıkmaz ve uyarı verilir", () => {
  const r = emeklilikHesapla({
    statu: "4b", cinsiyet: "erkek", dogum: "1985-01-01", giris: "2009-01-01",
    primGun: 2000, yillikGun: 0, bugun: "2026-10-20",
  })!;
  assert.equal(r.enErken, null);
  assert.ok(r.uyarilar.some((u) => u.includes("devam etmezseniz")));
});

test("geçersiz girdi null döner", () => {
  assert.equal(
    emeklilikHesapla({ statu: "4a", cinsiyet: "erkek", dogum: "2000-01-01", giris: "1999-01-01", primGun: 0, yillikGun: 360, bugun: "2026-10-20" }),
    null
  );
});
