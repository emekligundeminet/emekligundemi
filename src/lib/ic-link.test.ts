import assert from "node:assert/strict";
import test from "node:test";
import * as cheerio from "cheerio";
import { icLinkAyarlari, icLinkleriEkle, VARSAYILAN_IC_LINKLER, type IcLinkKaydi } from "./ic-link";

const isle = (html: string, yol = "/bir-haber", max = 5, kayitlar: IcLinkKaydi[] = VARSAYILAN_IC_LINKLER) => {
  const $ = cheerio.load(html, undefined, false);
  const n = icLinkleriEkle($, yol, { kayitlar, max });
  return { html: $.html(), n };
};

test("ifadeyi ekiyle birlikte bağlar, her hedefe tek link", () => {
  const { html, n } = isle("<p>Emekliler bayram ikramiyesini bekliyor. Bayram ikramiyesi 4 bin lira.</p>");
  assert.equal(n, 1);
  assert.match(html, /<a href="\/araclar\/emekli-bayram-ikramiyesi"[^>]*>bayram ikramiyesini<\/a>/);
  assert.equal(html.match(/<a /g)?.length, 1);
});

test("başlıklara ve mevcut linklere dokunmaz", () => {
  const { html, n } = isle('<h2>Bayram ikramiyesi ne zaman?</h2><p><a href="/x">bayram ikramiyesi</a> yattı.</p>');
  assert.equal(n, 0);
  assert.ok(!html.includes("/araclar/"));
});

test("metinde zaten linkli hedefe ikinci link vermez", () => {
  const { n } = isle('<p><a href="https://emekliler.org/araclar/emekli-bayram-ikramiyesi">hesapla</a>. Bayram ikramiyesi yatıyor.</p>');
  assert.equal(n, 0);
});

test("sayfa kendine link vermez", () => {
  const { n } = isle("<p>Alım gücü kaybı büyüdü.</p>", "/araclar/alim-gucu-kaybi");
  assert.equal(n, 0);
});

test("kelimenin ortasında eşleşmez", () => {
  const { n } = isle("<p>Yalım gücü yazım hatası olsun.</p>");
  assert.equal(n, 0);
});

test("sayfa başına link sınırı uygulanır", () => {
  const { n } = isle(
    "<p>Emekli zammı belli oldu. Bayram ikramiyesi arttı. Alım gücü düştü. En düşük emekli aylığı yükseldi. Banka promosyonu arttı.</p>",
    "/x",
    3
  );
  assert.equal(n, 3);
});

test("HTML özel karakterleri korunur", () => {
  const { html } = isle("<p>A &amp; B: bayram ikramiyesi &lt;yüksek&gt;</p>");
  assert.match(html, /A &amp; B: <a [^>]*>bayram ikramiyesi<\/a> &lt;yüksek&gt;/);
});

const k = (kelimeler: string, hedef: string, ekler = true): IcLinkKaydi => ({ id: hedef, kelimeler, hedef, ekler, aktif: true });

test("kelime 4 kez geçse de yalnız ilk geçtiği yer linklenir", () => {
  const { html, n } = isle(
    "<p>Rehber yazısı. İkinci rehber.</p><p>Rehber üç. Rehber dört.</p>",
    "/x",
    5,
    [k("rehber", "/blog/a")]
  );
  assert.equal(n, 1);
  assert.match(html, /^<p><a href="\/blog\/a">Rehber<\/a> yazısı\./);
});

test("Türkçe büyük İ / küçük i eşleşir", () => {
  const { n } = isle("<p>EMEKLİ ZAMMI açıklandı.</p>", "/x", 5, [k("emekli zammı", "/araclar/z")]);
  assert.equal(n, 1);
});

test("ekler kapalıyken ekli kelime eşleşmez", () => {
  assert.equal(isle("<p>Promosyonları gördünüz mü?</p>", "/x", 5, [k("promosyon", "/k", false)]).n, 0);
  assert.equal(isle("<p>Promosyon arttı.</p>", "/x", 5, [k("promosyon", "/k", false)]).n, 1);
});

test("uzun ifade kısa olandan önce bağlanır", () => {
  const { html } = isle("<p>En düşük emekli maaşı arttı.</p>", "/x", 5, [k("emekli maaşı", "/kisa"), k("en düşük emekli maaşı", "/uzun")]);
  assert.match(html, /href="\/uzun">En düşük emekli maaşı</);
});

test("pasif kural ve geçersiz hedef kullanılmaz; ayar yoksa varsayılan gelir", () => {
  const ayar = icLinkAyarlari({ icLinkler: [{ kelimeler: "zam", hedef: "https://emekliler.org/araclar/z/", aktif: false }, { kelimeler: "x", hedef: "javascript:alert(1)" }], icLinkMax: 99 });
  assert.equal(ayar.kayitlar.length, 1);
  assert.equal(ayar.kayitlar[0].hedef, "/araclar/z");
  assert.equal(ayar.max, 5);
  assert.equal(icLinkAyarlari({}).kayitlar, VARSAYILAN_IC_LINKLER);
});
