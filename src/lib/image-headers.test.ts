import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sizeFromImageBuffer } from "@/lib/image-headers";

describe("image header size", () => {
  it("PNG IHDR", () => {
    const buf = Buffer.alloc(24);
    buf[0] = 0x89;
    buf[1] = 0x50;
    buf[2] = 0x4e;
    buf[3] = 0x47;
    buf.writeUInt32BE(1600, 16);
    buf.writeUInt32BE(900, 20);
    assert.deepEqual(sizeFromImageBuffer(buf), { width: 1600, height: 900 });
  });
});
