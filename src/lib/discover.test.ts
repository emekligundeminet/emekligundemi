import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { coverWidthError, DISCOVER_COVER_MIN_WIDTH, publishFieldErrors } from "@/lib/discover";
import {
  coverSizeFromUrl,
  INDEX_ROBOTS,
  NOINDEX_FOLLOW_ROBOTS,
  toIso8601,
  wordCountFromHtml,
} from "@/lib/seo";

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

  it("kapak URL ölçüleri uydurma değil", () => {
    assert.deepEqual(coverSizeFromUrl("https://x.supabase.co/a.webp?w=1600&h=900"), {
      width: 1600,
      height: 900,
    });
    assert.deepEqual(coverSizeFromUrl("https://x.supabase.co/a.webp"), {
      width: undefined,
      height: undefined,
    });
  });

  it("ISO 8601 ve kelime sayısı", () => {
    assert.match(toIso8601("2026-08-31T00:00:00+03:00"), /T/);
    assert.equal(wordCountFromHtml("<p>Bir iki üç</p>"), 3);
    assert.equal(wordCountFromHtml("<script>x</script><p>tek</p>"), 1);
  });
});
