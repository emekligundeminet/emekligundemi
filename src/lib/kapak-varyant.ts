/**
 * Üretilen kapaklar iki boyutta yüklenir: `…@1600.webp` ve `…@800.webp`.
 * LCP kapağı optimizer'ı atladığı için telefona 800px'i biz veririz.
 * İşaretsiz (elle yüklenmiş) kapaklarda srcset yok; tek dosya kullanılır.
 */
export const KAPAK_BUYUK = "@1600.webp";
export const KAPAK_KUCUK = "@800.webp";

/** Telefonda tam genişlik, masaüstünde içerik sütunu (~800px). */
export const KAPAK_SIZES = "(max-width: 900px) 100vw, 800px";

export function kapakSrcSet(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  const [yol] = src.split("?");
  if (!yol.endsWith(KAPAK_BUYUK)) return undefined;
  const kucuk = `${yol.slice(0, -KAPAK_BUYUK.length)}${KAPAK_KUCUK}?w=800&h=450`;
  return `${kucuk} 800w, ${src} 1600w`;
}
