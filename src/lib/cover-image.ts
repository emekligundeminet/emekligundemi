import "server-only";
import { coverWidthError, DISCOVER_COVER_MIN_WIDTH } from "@/lib/discover";
import { sizeFromImageBuffer } from "@/lib/image-headers";

export { DISCOVER_COVER_MIN_WIDTH };

async function sharpLib() {
  return (await import("sharp")).default;
}

export function measureSizeFromBuffer(input: Buffer): { width: number; height: number } | null {
  return sizeFromImageBuffer(input);
}

export async function measureImageWidth(input: Buffer): Promise<number | null> {
  const header = sizeFromImageBuffer(input);
  if (header?.width) return header.width;
  try {
    const sharp = await sharpLib();
    const meta = await sharp(input).rotate().metadata();
    return meta.width ?? null;
  } catch {
    return null;
  }
}

export async function assertUploadCoverWidth(
  input: Buffer,
  clientWidth?: number | null
): Promise<number> {
  const fromFile = await measureImageWidth(input);
  const width =
    clientWidth && clientWidth >= DISCOVER_COVER_MIN_WIDTH
      ? clientWidth
      : (fromFile ?? (clientWidth && clientWidth > 0 ? clientWidth : null));
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
  const header = sizeFromImageBuffer(buf);
  if (header) return header;
  try {
    const sharp = await sharpLib();
    const meta = await sharp(buf).metadata();
    return { width: meta.width, height: meta.height };
  } catch {
    return {};
  }
}
