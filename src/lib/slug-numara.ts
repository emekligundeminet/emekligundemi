import { slugify } from "@/lib/slugify";

/**
 * Otomatik taslak adresi: başlıktan slug + 6 haneli rastgele numara
 * ("emekliye-ocak-zammi-belli-oldu-482915"), Sözcü'deki gibi. Numara aynı
 * başlıklı haberlerin çakışmasını önler; başlık değişse de korunur.
 */
const NUMARA = /-(\d{6})$/;

export function yeniSlugNumarasi() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export function slugNumarasi(slug: string | null | undefined) {
  return slug?.match(NUMARA)?.[1] ?? null;
}

export function numaraliSlug(baslik: string, numara: string = yeniSlugNumarasi()) {
  const govde = slugify(baslik).slice(0, 90).replace(/-+$/, "");
  return govde ? `${govde}-${numara}` : numara;
}
