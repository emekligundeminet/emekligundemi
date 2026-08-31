import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sitemapImageUrl } from "@/lib/seo";

const SUPABASE = "https://x.supabase.co/storage/v1/object/public/article-images/t/1-a.jpg";

describe("sitemapImageUrl", () => {
  it("ham & bırakmaz: ?w=&h= query'si atılır", () => {
    const out = sitemapImageUrl(`${SUPABASE}?w=1600&h=900`);
    assert.equal(out, SUPABASE);
    assert.ok(!out!.includes("&"));
  });

  it("query yoksa URL aynı kalır", () => {
    assert.equal(sitemapImageUrl(SUPABASE), SUPABASE);
  });

  it("XML'i kırabilecek karakter kalırsa görsel atlanır", () => {
    assert.equal(sitemapImageUrl("https://x.co/a&b.jpg"), null);
    assert.equal(sitemapImageUrl("not-a-url"), null);
    assert.equal(sitemapImageUrl("   "), null);
  });
});
