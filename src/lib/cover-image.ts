import "server-only";
import sharp from "sharp";
import { coverWidthError, DISCOVER_COVER_MIN_WIDTH, publishFieldErrors } from "@/lib/discover";

const MAX_BYTES = 8 * 1024 * 1024;

export { DISCOVER_COVER_MIN_WIDTH };

export async function measureImageWidth(input: Buffer): Promise<number | null> {
  try {
    const meta = await sharp(input).rotate().metadata();
    return meta.width ?? null;
  } catch {
    return null;
  }
}

export async function measureImageWidthFromUrl(url: string): Promise<number | null> {
  const res = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
    headers: { Accept: "image/*" },
  });
  if (!res.ok) return null;
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len > MAX_BYTES) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) return null;
  return measureImageWidth(buf);
}

export async function assertPublishReady(input: {
  coverUrl?: string | null;
  authorId?: string | null;
  excerpt?: string | null;
}): Promise<void> {
  const fields = publishFieldErrors(input);
  if (fields.length) throw new Error(fields[0]);
  const url = input.coverUrl!.trim();
  const width = await measureImageWidthFromUrl(url);
  const sizeErr = coverWidthError(width);
  if (sizeErr) throw new Error(sizeErr);
}

export async function assertUploadCoverWidth(input: Buffer): Promise<number> {
  const width = await measureImageWidth(input);
  const err = coverWidthError(width);
  if (err) throw new Error(err);
  return width ?? DISCOVER_COVER_MIN_WIDTH;
}
