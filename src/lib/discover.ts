/** Google Keşfet kapak: en az 1200px geniş (resmi şart). */
export const DISCOVER_COVER_MIN_WIDTH = 1200;

export function publishFieldErrors(input: {
  coverUrl?: string | null;
  authorId?: string | null;
  excerpt?: string | null;
}): string[] {
  const errors: string[] = [];
  if (!input.coverUrl?.trim()) {
    errors.push(`Keşfet için kapak gerekli (en az ${DISCOVER_COVER_MIN_WIDTH}px geniş).`);
  }
  if (!input.authorId?.trim()) {
    errors.push("Yayında imzalı yazar gerekli.");
  }
  if (!input.excerpt?.trim()) {
    errors.push("Arama ve Keşfet snippet’i için özet gerekli.");
  }
  return errors;
}

export function coverWidthError(width: number | null | undefined): string | null {
  if (width == null || width < DISCOVER_COVER_MIN_WIDTH) {
    return `Kapak en az ${DISCOVER_COVER_MIN_WIDTH}px geniş olmalı (Google Keşfet). Yüklenen: ${width ?? "?"}px.`;
  }
  return null;
}
