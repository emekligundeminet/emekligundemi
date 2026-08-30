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
