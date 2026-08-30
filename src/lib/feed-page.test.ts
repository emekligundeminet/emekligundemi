import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { feedPagePath, parseFeedPage, sayfaQueryRedirectPath } from "@/lib/feed-page";

describe("feed page path (ISR, searchParams yok)", () => {
  it("parseFeedPage yalnızca pozitif tam sayı", () => {
    assert.equal(parseFeedPage("2"), 2);
    assert.equal(parseFeedPage("1"), 1);
    assert.equal(parseFeedPage(undefined), null);
    assert.equal(parseFeedPage("0"), null);
    assert.equal(parseFeedPage("2.5"), null);
    assert.equal(parseFeedPage("abc"), null);
  });

  it("feedPagePath: 1 = taban, >1 = /sayfa/n", () => {
    assert.equal(feedPagePath("/kategori/gundem", 1), "/kategori/gundem");
    assert.equal(feedPagePath("/kategori/gundem", 2), "/kategori/gundem/sayfa/2");
    assert.equal(feedPagePath("/blog", 3), "/blog/sayfa/3");
  });

  it("eski ?sayfa= yalnızca feed index URL'lerinde yönlenir", () => {
    assert.equal(sayfaQueryRedirectPath("/kategori/gundem", "2"), "/kategori/gundem/sayfa/2");
    assert.equal(sayfaQueryRedirectPath("/blog", "1"), "/blog");
    assert.equal(sayfaQueryRedirectPath("/blog/bir-yazi", "2"), null);
    assert.equal(sayfaQueryRedirectPath("/kategori/gundem", null), null);
    assert.equal(sayfaQueryRedirectPath("/ara", "2"), null);
  });
});
