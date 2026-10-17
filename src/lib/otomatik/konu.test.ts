import assert from "node:assert/strict";
import test from "node:test";
import { emekliKonusuMu, kapakIcinKisalt, kategoriTahmin } from "./konu";

const SLUGS = ["guncel", "emekli-maasi", "zam", "sgk", "promosyon", "ikramiye-ve-odemeler", "emekli-yasam", "gundem"];

test("başlığında emekli konusu olan geçer", () => {
  assert.equal(emekliKonusuMu("Emekliye ocak zammı netleşiyor", ""), true);
  assert.equal(emekliKonusuMu("Eylül ayı enflasyon rakamları açıklandı", ""), true);
  assert.equal(emekliKonusuMu("Bağ-Kur'lulara prim affı geliyor", ""), true);
});

test("emekliyi sıfat olarak kullanan başlık elenir", () => {
  assert.equal(emekliKonusuMu("Emekli general açıklama yaptı", "emekli maaşı\nemekli maaşı"), false);
  assert.equal(emekliKonusuMu("Emekli tümgeneral konuştu", ""), false);
});

test("gövdede tek SGK geçen politika haberi elenir", () => {
  const govde = "Bakanlıkta görev değişimi yaşandı.\nSGK başkan yardımcılığına atama yapıldı.\nDiğer atamalar da belli oldu.";
  assert.equal(emekliKonusuMu("13 bakanlıkta görev değişimi", govde), false);
});

test("gövdede iki paragrafta emekli + para geçen haber geçer", () => {
  const govde = "Yeni düzenleme Meclis'e geldi.\nEmekli aylıkları ocakta artacak.\nSSK ve Bağ-Kur emeklisinin maaşı yeniden hesaplanacak.";
  assert.equal(emekliKonusuMu("Meclis'te yeni düzenleme", govde), true);
});

test("kategori başlıktan tahmin edilir", () => {
  assert.equal(kategoriTahmin("Banka promosyonları yükseldi", "", SLUGS), "promosyon");
  assert.equal(kategoriTahmin("Bayram ikramiyesi ne zaman ödenecek", "", SLUGS), "ikramiye-ve-odemeler");
  assert.equal(kategoriTahmin("Emekliye ocak zammı", "", SLUGS), "zam");
  assert.equal(kategoriTahmin("Emekliler ne zaman yola çıkmalı", "", SLUGS), "gundem");
  assert.equal(kategoriTahmin("Dolandırıcılara dikkat", "Hiçbir anahtar yok", SLUGS), "gundem");
});

test("uzun başlık kelime sınırında kısaltılır", () => {
  const uzun = "Emekliye müjde: SSK ve Bağ-Kur emeklilerinin ocak ayı zammı için ekonomistlerin yıl sonu enflasyon tahmini netleşti";
  const kisa = kapakIcinKisalt(uzun);
  assert.ok(kisa.length <= 91);
  assert.ok(kisa.endsWith("…"));
  assert.equal(kapakIcinKisalt("Kısa başlık"), "Kısa başlık");
});
