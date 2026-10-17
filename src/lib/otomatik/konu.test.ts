import assert from "node:assert/strict";
import test from "node:test";
import { araBaslikMi } from "../haber-draft";
import { emekliKonusuMu, kapakIcinKisalt, kategoriTahmin, otomatikOzet } from "./konu";

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

test("büyük harfli kısa satır ara başlık sayılır", () => {
  assert.equal(araBaslikMi("ASKERLİK İZNİNDE 10 GÜN ÇALIŞTI"), true);
  assert.equal(araBaslikMi("YARGITAY KARARI ONADI"), true);
  assert.equal(araBaslikMi("Yargıtay 10. Hukuk Dairesi kararını verdi."), false);
  assert.equal(araBaslikMi("SGK AÇIKLADI: ÖDEMELER BAŞLADI."), false);
  assert.equal(araBaslikMi("2026"), false);
});

test("otomatik özet ilk dolu paragraftan, cümle sonundan kesilir", () => {
  const govde =
    "ASKERLİK İZNİNDE 10 GÜN ÇALIŞTI\nKısa satır.\nYargıtay 10. Hukuk Dairesi, askerlik sırasında izinde çalışan emeklinin sigorta günleri için emsal karar verdi. Mahkeme yerel mahkemenin kararını onadı ve SGK'nin itirazını reddetti.\nİkinci paragraf.";
  const ozet = otomatikOzet(govde)!;
  assert.ok(ozet.startsWith("Yargıtay"));
  assert.ok(ozet.length <= 160);
  assert.ok(ozet.endsWith("verdi."));
  assert.equal(otomatikOzet("Kısa.\nÇOK KISA"), null);
});

test("cümle sonu yoksa kelime sınırında üç noktayla kesilir", () => {
  const uzun = "Emekli aylıklarına ocak ayında yapılacak artış için ekonomistlerin tahminleri netleşirken SSK ve Bağ-Kur emeklilerinin alacağı en düşük aylık tutarı da merak konusu oldu ve hesaplamalar sürüyor";
  const ozet = otomatikOzet(uzun, 155)!;
  assert.ok(ozet.length <= 156);
  assert.ok(ozet.endsWith("…"));
});
