import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coverAltWarning, looksLikeSlug } from "@/lib/cover-alt";

describe("kapak alt metni", () => {
  it("slug ve dosya adını yakalar", () => {
    assert.equal(looksLikeSlug("emekliye-zam-hazirligi"), true);
    assert.equal(looksLikeSlug("emekliye-ek-zam-soylentileri-2027-ve-2028i"), true);
    assert.equal(looksLikeSlug("img_2043.jpg"), true);
    assert.equal(looksLikeSlug("kapak-1.webp"), true);
  });

  it("gerçek cümleyi slug sanmaz", () => {
    assert.equal(looksLikeSlug("TBMM Genel Kurulu salonu"), false);
    assert.equal(looksLikeSlug("Emekli maaşı zam tablosu"), false);
  });

  it("uyarı üretir", () => {
    assert.match(coverAltWarning("emekliye-zam-hazirligi")!, /dosya adı/);
    assert.match(coverAltWarning("emekli")!, /tek kelime/);
    assert.match(coverAltWarning("a ".repeat(80))!, /çok uzun/);
  });

  it("boş ve düzgün metinde uyarı yok", () => {
    assert.equal(coverAltWarning(""), null);
    assert.equal(coverAltWarning("TBMM Genel Kurulu salonu"), null);
  });
});
