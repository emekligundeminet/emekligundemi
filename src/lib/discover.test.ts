import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coverWidthError, DISCOVER_COVER_MIN_WIDTH, publishFieldErrors } from "@/lib/discover";
import { INDEX_ROBOTS, NOINDEX_FOLLOW_ROBOTS } from "@/lib/seo";

describe("Keşfet yayın eşiği", () => {
  it("1200px altı kapak reddedilir", () => {
    assert.equal(DISCOVER_COVER_MIN_WIDTH, 1200);
    assert.ok(coverWidthError(1199));
    assert.equal(coverWidthError(1200), null);
    assert.equal(coverWidthError(1920), null);
    assert.ok(coverWidthError(null));
  });

  it("yayında kapak + yazar + özet ister", () => {
    assert.equal(publishFieldErrors({ coverUrl: "https://x/a.webp", authorId: "1", excerpt: "özet" }).length, 0);
    assert.ok(publishFieldErrors({}).length >= 3);
  });

  it("index robots Keşfet büyük önizleme taşır", () => {
    assert.equal(INDEX_ROBOTS.googleBot["max-image-preview"], "large");
    assert.equal(NOINDEX_FOLLOW_ROBOTS.index, false);
  });
});
