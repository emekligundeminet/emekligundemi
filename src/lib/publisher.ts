/** Künye ve yasal metinler — şirket yok, şahıs yayını. */
export const PUBLISHER_NAME = "İsmail Çavuş";
export const PUBLISHER_ROLE = "Yayın sahibi ve sorumlu müdür";
export const CONTACT_EMAIL = "info@emekliler.org";
export const ADS_EMAIL = "reklam@emekliler.org";
export const HOSTING_NOTE =
  "Uygulama Vercel üzerinde, veritabanı ve dosya depolama Supabase üzerinde barındırılır.";
export const CORRECTION_SLA = "5 iş günü";

/** Google News publisher.logo: SVG kabul etmez, en az 112px raster (600×160). */
export const PUBLISHER_LOGO_PATH = "/emekli-haberleri.png";

export function publisherLogoUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}${PUBLISHER_LOGO_PATH}`;
}
