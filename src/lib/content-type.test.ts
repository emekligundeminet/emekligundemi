import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  articlePath,
  filterNewsSitemap,
  isGuide,
  isReservedBlogIndexSlug,
  jsonLdSchemaType,
  parseContentType,
  RESERVED_CONTENT_SLUGS,
  uniquifySlug,
} from "@/lib/content-type";

/** Store PATCH: kategori değişince type yazılmaz. */
function categoryOnlyPatch(category_id: string) {
  return { category_id } as { category_id: string; type?: string };
}

describe("articles.type tek karar kaynağı", () => {
  it("guide: URL /blog/{slug}, JSON-LD Article; kategori URL'i değiştirmez", () => {
    const guide = { slug: "prim-gunu", type: "guide" as const, category_slug: "sgk" };
    assert.equal(articlePath(guide), "/blog/prim-gunu");
    assert.equal(jsonLdSchemaType(guide.type), "Article");
    assert.equal(isGuide(guide.type), true);
    assert.equal(articlePath({ slug: guide.slug, type: guide.type }), "/blog/prim-gunu");
    assert.equal(parseContentType(guide.type), "guide");
  });

  it("news: URL /{slug}, JSON-LD NewsArticle; kategori blog olsa bile haber kalır", () => {
    const news = { slug: "emekli-zammi", type: "news" as const, category_slug: "blog" };
    assert.equal(articlePath(news), "/emekli-zammi");
    assert.equal(jsonLdSchemaType(news.type), "NewsArticle");
    assert.equal(isGuide(news.type), false);
    assert.equal(parseContentType("news"), "news");
    assert.equal(parseContentType("unknown"), "news");
  });

  it("kategori değişince type ve path aynı kalır", () => {
    const before = { slug: "eyt-nedir", type: "guide" as const, category_id: "cat-blog" };
    const afterCategoryOnly = { ...before, ...categoryOnlyPatch("cat-sgk") };
    assert.equal(afterCategoryOnly.type, before.type);
    assert.equal("type" in categoryOnlyPatch("cat-sgk"), false);
    assert.equal(articlePath(afterCategoryOnly), articlePath(before));
    assert.equal(articlePath(afterCategoryOnly), "/blog/eyt-nedir");
  });

  it("type news↔guide değişince path değişir (eski URL 301 hedefi)", () => {
    const slug = "maas-hesabi";
    assert.equal(articlePath({ slug, type: "news" }), "/maas-hesabi");
    assert.equal(articlePath({ slug, type: "guide" }), "/blog/maas-hesabi");
  });

  it("news sitemap HARD: guide asla geçmez; news geçer (kategori önemsiz)", () => {
    const rows = [
      { slug: "haber-1", type: "news" as const },
      { slug: "rehber-1", type: "guide" as const, category_slug: "sgk" },
      { slug: "rehber-2", type: "guide" as const, category_slug: "blog" },
      { slug: "haber-2", type: "news" as const, category_slug: "blog" },
    ];
    const news = filterNewsSitemap(rows);
    assert.deepEqual(
      news.map((r) => r.slug),
      ["haber-1", "haber-2"]
    );
    assert.ok(news.every((r) => r.type === "news"));
    assert.equal(
      news.filter((r) => r.type !== "news").length,
      0
    );
    assert.equal(filterNewsSitemap([{ slug: "x", type: "guide" }]).length, 0);
  });

  it("/blog listesi: yalnızca published guide", () => {
    const published = [
      { slug: "a", type: "guide", status: "published" },
      { slug: "b", type: "news", status: "published" },
      { slug: "c", type: "guide", status: "draft" },
    ];
    const blogList = published.filter((r) => r.type === "guide" && r.status === "published");
    assert.deepEqual(
      blogList.map((r) => r.slug),
      ["a"]
    );
  });

  it("anasayfa/manşet: yalnızca news; guide yok", () => {
    const published = [
      { slug: "a", type: "guide", is_manset: true },
      { slug: "b", type: "news", is_manset: true },
    ];
    const home = published.filter((r) => r.type === "news");
    assert.deepEqual(
      home.map((r) => r.slug),
      ["b"]
    );
  });

  it("breadcrumb topical: type değil category_name", () => {
    const guideInSgk = {
      type: "guide" as const,
      slug: "prim-gunu",
      category_slug: "sgk",
      category_name: "SGK",
    };
    assert.equal(articlePath(guideInSgk), "/blog/prim-gunu");
    assert.equal(guideInSgk.category_name, "SGK");
    assert.notEqual(guideInSgk.category_slug, "blog");
  });

  it("reserved slug çakışırsa suffix", () => {
    assert.equal(uniquifySlug("blog", []), "blog-2");
    assert.equal(uniquifySlug("admin", []), "admin-2");
    assert.equal(uniquifySlug("kategori", []), "kategori-2");
    assert.equal(uniquifySlug("api", []), "api-2");
    assert.equal(uniquifySlug("sitemap", []), "sitemap-2");
    assert.equal(uniquifySlug("hesaplama", []), "hesaplama-2");
    assert.equal(uniquifySlug("zam-haber", []), "zam-haber");
    assert.equal(uniquifySlug("zam-haber", ["zam-haber"]), "zam-haber-2");
    assert.ok(RESERVED_CONTENT_SLUGS.has("blog"));
    assert.ok(RESERVED_CONTENT_SLUGS.has("ara"));
    assert.ok(RESERVED_CONTENT_SLUGS.has("yazar"));
    assert.ok(RESERVED_CONTENT_SLUGS.has("hakkimizda"));
    assert.ok(RESERVED_CONTENT_SLUGS.has("yasal"));
    assert.ok(RESERVED_CONTENT_SLUGS.has("arsiv"));
  });

  it("public path ve canonical /t/ içermez", () => {
    assert.equal(articlePath({ slug: "emekli-zammi", type: "news" }), "/emekli-zammi");
    assert.ok(!articlePath({ slug: "emekli-zammi", type: "news" }).includes("/t/"));
    assert.ok(!articlePath({ slug: "rehber", type: "guide" }).includes("/t/"));
  });

  it("/kategori/blog yönü reserved index slug; type değil", () => {
    assert.equal(isReservedBlogIndexSlug("blog"), true);
    assert.equal(isReservedBlogIndexSlug("rehber"), true);
    assert.equal(isReservedBlogIndexSlug("sgk"), false);
    assert.equal(isGuide("sgk"), false);
  });
});
