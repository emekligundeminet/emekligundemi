/**
 * Kapak alt metni erişilebilirlik içindir: görseli tarif eden bir cümle.
 * Dosya adı / slug yapıştırmak ekran okuyucuya anlamsız gelir ve
 * anahtar kelime tekrarı olarak okunur.
 */

const SLUGLIKE = /^[a-z0-9]+(?:[-_][a-z0-9]+)+$/;

/** "emekliye-zam-hazirligi", "IMG_2043.jpg" gibi girdiler. */
export function looksLikeSlug(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  const withoutExt = trimmed.replace(/\.(jpe?g|png|webp|gif|avif)$/i, "");
  return SLUGLIKE.test(withoutExt.toLowerCase());
}

/** Admin formunda gösterilecek uyarı; sorun yoksa null. */
export function coverAltWarning(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (looksLikeSlug(trimmed)) {
    return "Bu bir dosya adı/slug gibi görünüyor. Görseli tarif eden bir cümle yazın: “TBMM Genel Kurulu salonu”.";
  }
  if (!trimmed.includes(" ")) {
    return "Alt metni tek kelime olmamalı; görseli kısaca tarif edin.";
  }
  if (trimmed.length > 125) {
    return "Alt metni çok uzun; 125 karakterin altında tutun.";
  }
  return null;
}
