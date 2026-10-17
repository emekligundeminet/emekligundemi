import assert from "node:assert/strict";
import test from "node:test";
import { stokSec, type StokGorsel } from "./stok";

const g = (kategori: string, n: number): StokGorsel => ({ path: `${kategori}-${n}`, kategori, url: "" });

test("zam ve emekli maaşı aynı havuzdan seçer", () => {
  const stoklar = [g("zam", 1), g("genel", 1)];
  assert.equal(stokSec(stoklar, "emekli-maasi", [])?.kategori, "zam");
  assert.equal(stokSec([g("emekli-maasi", 1)], "zam", [])?.kategori, "emekli-maasi");
});

test("kategoride yoksa genel havuza düşer, o da yoksa null", () => {
  assert.equal(stokSec([g("genel", 1)], "sgk", [])?.kategori, "genel");
  assert.equal(stokSec([g("zam", 1)], "sgk", []), null);
});

test("son kullanılanları atlar, hepsi kullanıldıysa yine seçer", () => {
  const stoklar = [g("zam", 1), g("zam", 2)];
  const son = ["zam-1"];
  assert.equal(stokSec(stoklar, "zam", son)?.path, "zam-2");
  assert.ok(stokSec(stoklar, "zam", son));
});
