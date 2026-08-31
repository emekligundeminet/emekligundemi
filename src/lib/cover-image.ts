import "server-only";
import { coverWidthError, DISCOVER_COVER_MIN_WIDTH } from "@/lib/discover";
import { sizeFromImageBuffer } from "@/lib/image-headers";

export { DISCOVER_COVER_MIN_WIDTH };

export function measureSizeFromBuffer(input: Buffer): { width: number; height: number } | null {
  return sizeFromImageBuffer(input);
}

export function assertUploadCoverWidth(input: Buffer, clientWidth?: number | null): number {
  const fromFile = sizeFromImageBuffer(input)?.width ?? null;
  const width =
    clientWidth && clientWidth >= DISCOVER_COVER_MIN_WIDTH
      ? clientWidth
      : (fromFile ?? (clientWidth && clientWidth > 0 ? clientWidth : null));
  const err = coverWidthError(width);
  if (err) throw new Error(err);
  return width ?? DISCOVER_COVER_MIN_WIDTH;
}
