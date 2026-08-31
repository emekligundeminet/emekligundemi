import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tenantCacheRewritePath } from "@/lib/tenant-rewrite";

const TID = "c0a80101-0000-4000-a000-000000000001";

describe("tenant rewrite", () => {
  it("yasal sayfalar ISR ağacına girer", () => {
    assert.equal(tenantCacheRewritePath("/yayin-ilkeleri", TID), `/t/${TID}/yayin-ilkeleri`);
    assert.equal(tenantCacheRewritePath("/kunye", TID), `/t/${TID}/kunye`);
    assert.equal(tenantCacheRewritePath("/yasal/gizlilik", TID), `/t/${TID}/yasal/gizlilik`);
  });

  it("308 kaynakları ve admin rewrite olmaz", () => {
    assert.equal(tenantCacheRewritePath("/gizlilik", TID), null);
    assert.equal(tenantCacheRewritePath("/hakkimizda", TID), null);
    assert.equal(tenantCacheRewritePath("/admin", TID), null);
  });
});
