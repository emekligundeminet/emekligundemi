import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  asMonthMap,
  asNumber,
  hesaplaAlimGucu,
  hesaplaZam,
  kumulatifTufe,
} from "@/lib/hesap-formulas";

describe("hesap formülleri (oran kodda yok)", () => {
  it("SSK zammı: yeni maaş, fark, taban yok", () => {
    const r = hesaplaZam({
      mevcutMaas: 20000,
      tip: "ssk_bagkur",
      zamSskBagkur: 17.76,
      zamMemur: 13,
      taban: 18000,
    });
    assert.equal(Math.round(r.yeniMaas), 23552);
    assert.equal(r.tabanUygulandi, false);
    assert.ok(r.fark > 0);
  });

  it("taban tamamlaması uygulanır", () => {
    const r = hesaplaZam({
      mevcutMaas: 10000,
      tip: "ssk_bagkur",
      zamSskBagkur: 10,
      zamMemur: 5,
      taban: 20000,
    });
    assert.equal(r.odenen, 20000);
    assert.equal(r.tabanUygulandi, true);
    assert.equal(r.fark, 10000);
  });

  it("memur oranı SSK'dan ayrı", () => {
    const ssk = hesaplaZam({
      mevcutMaas: 10000,
      tip: "ssk_bagkur",
      zamSskBagkur: 20,
      zamMemur: 10,
      taban: 0,
    });
    const memur = hesaplaZam({
      mevcutMaas: 10000,
      tip: "memur",
      zamSskBagkur: 20,
      zamMemur: 10,
      taban: 0,
    });
    assert.equal(ssk.oranYuzde, 20);
    assert.equal(memur.oranYuzde, 10);
    assert.equal(ssk.odenen, 12000);
    assert.equal(memur.odenen, 11000);
  });

  it("TÜFE kümülatif çarpım", () => {
    const k = kumulatifTufe({ "2026-01": 10, "2026-02": 10 });
    assert.ok(Math.abs(k - 0.21) < 1e-9);
  });

  it("alım gücü: endeks oranı", () => {
    const r = hesaplaAlimGucu({ tutar: 10000, endeksGecis: 100, endeksBugun: 250 });
    assert.ok(r);
    assert.equal(r.bugunkuKarsilik, 25000);
    assert.equal(r.kayipYuzde, 60);
  });

  it("asNumber / asMonthMap", () => {
    assert.equal(asNumber("17,76"), 17.76);
    assert.deepEqual(asMonthMap({ "2026-01": 4.84 }), { "2026-01": 4.84 });
  });
});

import { donemAylari, donemEnflasyonu, memurZamYuzde, parseTutar, tutarYaz } from "@/lib/hesap-formulas";

describe("tutar girişi", () => {
  it("Türkçe yazımları doğru okur", () => {
    assert.equal(parseTutar("25000"), 25000);
    assert.equal(parseTutar("25.000"), 25000);
    assert.equal(parseTutar("25.000,50"), 25000.5);
    assert.equal(parseTutar("25000,5"), 25000.5);
    assert.equal(parseTutar("25 000 TL"), 25000);
    assert.equal(parseTutar("1.250.000"), 1250000);
    assert.equal(parseTutar("23552.75"), 23552.75);
    assert.equal(parseTutar(""), 0);
    assert.equal(parseTutar("abc"), 0);
  });
  it("yazarken binlik ayırıcı ekler", () => {
    assert.equal(tutarYaz("25000"), "25.000");
    assert.equal(tutarYaz("25.000,5"), "25.000,5");
    assert.equal(tutarYaz("1234567,891"), "1.234.567,89");
    assert.equal(parseTutar(tutarYaz("23552,40")), 23552.4);
  });
});

describe("dönem zammı", () => {
  it("6 aylık dönem anahtarları yıl geçişini yapar", () => {
    assert.deepEqual(donemAylari("2026-07"), ["2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]);
    assert.deepEqual(donemAylari("2026-10", 4), ["2026-10", "2026-11", "2026-12", "2027-01"]);
  });
  // TÜİK 2025=100 endeksi (hakedis.org kopyası; aylık değişimler TÜİK bültenleriyle aynı).
  const ENDEKS = {
    "2025-12": 110.386963, "2026-01": 115.73, "2026-02": 119.16, "2026-03": 121.47, "2026-04": 126.55,
    "2026-05": 128.72, "2026-06": 129.99, "2026-07": 132.31, "2026-08": 134.75, "2026-09": 137.23,
  };
  it("Temmuz 2026 SSK zammı endeksten resmi %17,76 çıkar", () => {
    const r = donemEnflasyonu({ aylar: donemAylari("2026-01"), endeks: ENDEKS });
    assert.equal(r.kesin, true);
    assert.equal(Math.round(r.toplamYuzde * 100) / 100, 17.76);
  });
  it("açıklanmamış aylara tahmin uygulanır, kesinleşen ayrı tutulur", () => {
    const r = donemEnflasyonu({ aylar: donemAylari("2026-07"), endeks: ENDEKS, tahminAylik: 1.5 });
    assert.equal(r.kesin, false);
    assert.deepEqual(r.tahminAylar, ["2026-10", "2026-11", "2026-12"]);
    assert.equal(Math.round(r.kesinlesenYuzde * 100) / 100, 5.57);
    const beklenen = ((137.23 / 129.99) * 1.015 ** 3 - 1) * 100;
    assert.ok(Math.abs(r.toplamYuzde - beklenen) < 1e-9);
  });
  it("tahmin verilmezse açıklanan ayların ortalaması kullanılır", () => {
    const r = donemEnflasyonu({ aylar: donemAylari("2026-07"), endeks: ENDEKS });
    assert.equal(r.tahminAylik, 1.82);
  });
  it("endeks yoksa aylık yüzdelerle hesaplar", () => {
    const r = donemEnflasyonu({ aylar: ["2026-07", "2026-08"], aylik: { "2026-07": 2 } });
    assert.equal(r.tahminAylik, 2);
    assert.equal(Math.round(r.toplamYuzde * 100) / 100, 4.04);
  });
  it("memur emeklisi Temmuz 2026 ≈ %13,52 (TS %11 → %7)", () => {
    assert.equal(Math.round(memurZamYuzde(17.76, 11, 7) * 100) / 100, 13.52);
  });
  it("enflasyon toplu sözleşmenin altındaysa fark sıfır, yalnız TS verilir", () => {
    assert.equal(Math.round(memurZamYuzde(4, 7, 5) * 100) / 100, 5);
  });
});

import { emekliAyligiTahmini } from "@/lib/hesap-formulas";

describe("emekli aylığı tahmini (2008 sonrası)", () => {
  it("7200 gün = 20 yıl → %40 ABO", () => {
    const r = emekliAyligiTahmini({ primGun: 7200, aylikKazanc: 100000, taban: 23552 });
    assert.equal(r.aboYuzde, 40);
    assert.equal(r.aylik, 40000);
    assert.equal(r.tabanda, false);
  });
  it("ABO %90 tavanı aşmaz (16.200 gün = 45 yıl)", () => {
    const r = emekliAyligiTahmini({ primGun: 20000, aylikKazanc: 100000, taban: 0 });
    assert.equal(r.aboYuzde, 90);
    assert.equal(r.aboTavanda, true);
    assert.equal(r.aylik, 90000);
  });
  it("tabanın altı en düşük aylığa çekilir", () => {
    const r = emekliAyligiTahmini({ primGun: 5400, aylikKazanc: 50000, taban: 23552 });
    assert.equal(Math.round(r.ham), 15000);
    assert.equal(r.aylik, 23552);
    assert.equal(r.tabanda, true);
  });
  it("küsuratlı gün oransal işler (3600 gün = %20)", () => {
    assert.equal(emekliAyligiTahmini({ primGun: 3600, aylikKazanc: 1, taban: 0 }).aboYuzde, 20);
    assert.equal(emekliAyligiTahmini({ primGun: 3780, aylikKazanc: 1, taban: 0 }).aboYuzde, 21);
  });
});
