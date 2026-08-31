import { coverWidthError, publishFieldErrors } from "@/lib/discover";
import { coverSizeFromUrl } from "@/lib/seo";

/** Haber API: sharp yok. Ölçü yükleme URL’sindeki ?w= ile gelir. */
export function assertPublishReady(input: {
  coverUrl?: string | null;
  authorId?: string | null;
  excerpt?: string | null;
}): void {
  const fields = publishFieldErrors(input);
  if (fields.length) throw new Error(fields[0]);
  const { width } = coverSizeFromUrl(input.coverUrl!.trim());
  const sizeErr = coverWidthError(width ?? null);
  if (sizeErr) {
    throw new Error(
      width
        ? sizeErr
        : "Kapak ölçüsü okunamadı. Görseli panelden tekrar yükleyin (en az 1200px geniş)."
    );
  }
}
