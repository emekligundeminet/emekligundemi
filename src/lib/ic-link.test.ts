import assert from "node:assert/strict";
import test from "node:test";
import * as cheerio from "cheerio";
import { icLinkleriEkle } from "./ic-link";

const isle = (html: string, yol = "/bir-haber", max?: number) => {
  const $ = cheerio.load(html, undefined, false);
  const n = icLinkleriEkle($, yol, max);
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

test("haber başına en fazla 3 link", () => {
  const { n } = isle(
    "<p>Emekli zammı belli oldu. Bayram ikramiyesi arttı. Alım gücü düştü. En düşük emekli aylığı yükseldi. Banka promosyonu arttı.</p>"
  );
  assert.equal(n, 3);
});

test("HTML özel karakterleri korunur", () => {
  const { html } = isle("<p>A &amp; B: bayram ikramiyesi &lt;yüksek&gt;</p>");
  assert.match(html, /A &amp; B: <a [^>]*>bayram ikramiyesi<\/a> &lt;yüksek&gt;/);
});
