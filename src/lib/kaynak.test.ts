import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KAYNAK_MAX, hostLabel, kaynakRel, parseKaynaklar } from "@/lib/kaynak";

describe("kaynaklar", () => {
  it("varsayılan nofollow; dofollow yalnızca açıkça true ise", () => {
    assert.equal(kaynakRel(false), "nofollow noopener noreferrer");
    assert.equal(kaynakRel(true), "noopener noreferrer");
    const [a, b] = parseKaynaklar([
      { etiket: "Resmî Gazete", url: "https://resmigazete.gov.tr/x" },
      { etiket: "SGK", url: "https://sgk.gov.tr/y", dofollow: true },
    ]);
    assert.equal(a.dofollow, false);
    assert.equal(b.dofollow, true);
  });

  it("dofollow'u string 'true' ile açtırmaz", () => {
    const [row] = parseKaynaklar([{ etiket: "x", url: "https://a.com", dofollow: "true" }]);
    assert.equal(row.dofollow, false);
  });

  it("http/https dışındaki şemaları atar", () => {
    const rows = parseKaynaklar([
      { etiket: "kötü", url: "javascript:alert(1)" },
      { etiket: "kötü", url: "data:text/html,<script>" },
      { etiket: "yok", url: "" },
      { etiket: "iyi", url: "https://a.com" },
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].url, "https://a.com/");
  });

  it("etiket boşsa alan adına düşer", () => {
    const [row] = parseKaynaklar([{ url: "https://www.resmigazete.gov.tr/a" }]);
    assert.equal(row.etiket, "resmigazete.gov.tr");
    assert.equal(hostLabel("https://www.sgk.gov.tr/x"), "sgk.gov.tr");
  });

  it("dizi olmayan ve bozuk girdide boş döner", () => {
    assert.deepEqual(parseKaynaklar(null), []);
    assert.deepEqual(parseKaynaklar("bozuk"), []);
    assert.deepEqual(parseKaynaklar({ url: "https://a.com" }), []);
    assert.deepEqual(parseKaynaklar("[]"), []);
  });

  it("jsonb string olarak gelse de çözer", () => {
    const rows = parseKaynaklar('[{"etiket":"SGK","url":"https://sgk.gov.tr"}]');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].etiket, "SGK");
  });

  it("üst sınırı aşmaz", () => {
    const cok = Array.from({ length: 30 }, (_, i) => ({
      etiket: `k${i}`,
      url: `https://a.com/${i}`,
    }));
    assert.equal(parseKaynaklar(cok).length, KAYNAK_MAX);
  });
});
