import assert from "node:assert/strict";
import test from "node:test";
import { numaraliSlug, slugNumarasi, yeniSlugNumarasi } from "./slug-numara";

test("başlıktan slug + 6 haneli numara", () => {
  assert.match(numaraliSlug("Emekliye Ocak Zammı Belli Oldu!"), /^emekliye-ocak-zammi-belli-oldu-\d{6}$/);
  assert.equal(numaraliSlug("e-Devlet'te İptal", "123456"), "e-devlette-iptal-123456");
});

test("numara 100000–999999 arası ve başlık değişince korunabilir", () => {
  for (let i = 0; i < 200; i++) {
    const n = Number(yeniSlugNumarasi());
    assert.ok(n >= 100000 && n <= 999999);
  }
  const eski = numaraliSlug("Eski başlık", "482915");
  assert.equal(numaraliSlug("Yeni başlık", slugNumarasi(eski)!), "yeni-baslik-482915");
});

test("numarasız slugda numara yok", () => {
  assert.equal(slugNumarasi("emekli-maasina-haciz"), null);
  assert.equal(slugNumarasi("haber-2026"), null);
});
