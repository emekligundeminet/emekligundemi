import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as cheerio from "cheerio";
import { pickTocItems, stampHeadingIds } from "@/lib/article-toc";
import { articleToc, prepareArticleHtml } from "@/lib/prepare-article-html";

describe("rehber içindekiler", () => {
  it("iki H2 olunca kutu üretir, tek başlıkta üretmez", () => {
    const two = prepareArticleHtml("<h2>Kimler yararlanır</h2><p>a</p><h2>Nasıl hesaplanır</h2>");
    const toc = articleToc(two);
    assert.equal(toc.length, 2);
    assert.equal(toc[0]?.text, "Kimler yararlanır");
    assert.match(two, /id="b-kimler-yararlanir"/);

    const one = prepareArticleHtml("<h2>Tek başlık</h2><p>a</p>");
    assert.equal(articleToc(one).length, 0);
  });

  it("H2 yoksa H3 listesini kullanır; çakışan id'yi ayırır", () => {
    const html = prepareArticleHtml("<h3>Adım</h3><h3>Adım</h3>");
    const toc = articleToc(html);
    assert.equal(toc.length, 2);
    assert.notEqual(toc[0]?.id, toc[1]?.id);
  });

  it("yeterli H2 varken H3'ü TOC'a almaz", () => {
    const $ = cheerio.load("<h2>A</h2><h3>Alt</h3><h2>B</h2>", undefined, false);
    const items = stampHeadingIds($);
    assert.equal(items.length, 3);
    assert.deepEqual(
      pickTocItems(items).map((i) => i.text),
      ["A", "B"]
    );
  });
});
