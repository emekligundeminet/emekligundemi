import "server-only";
import { coverWidthError, DISCOVER_COVER_MIN_WIDTH } from "@/lib/discover";

export { DISCOVER_COVER_MIN_WIDTH };

async function sharpLib() {
  return (await import("sharp")).default;
}

export async function measureImageWidth(input: Buffer): Promise<number | null> {
  try {
    const sharp = await sharpLib();
    const meta = await sharp(input).rotate().metadata();
    return meta.width ?? null;
  } catch {
    return null;
  }
}

export async function assertUploadCoverWidth(input: Buffer): Promise<number> {
  const width = await measureImageWidth(input);
  const err = coverWidthError(width);
  if (err) throw new Error(err);
  return width ?? DISCOVER_COVER_MIN_WIDTH;
}

export async function toWebp(input: Buffer, maxWidth: number): Promise<Buffer> {
  const sharp = await sharpLib();
  return sharp(input)
    .rotate()
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
}

export async function webpSize(buf: Buffer): Promise<{ width?: number; height?: number }> {
  const sharp = await sharpLib();
  const meta = await sharp(buf).metadata();
  return { width: meta.width, height: meta.height };
}
