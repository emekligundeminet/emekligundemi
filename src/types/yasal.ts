export type YasalSayfa = {
  slug: string;
  baslik: string;
  icerik_md: string;
  guncelleme_tarihi: string;
  yayinda: boolean;
};

/** Kendi route'u olan kurumsal sayfalar — /yasal/{slug} değil. */
export const KURUMSAL_YASAL_SLUGS = [
  "yayin-ilkeleri",
  "duzeltme",
  "iletisim",
  "reklam",
] as const;

export type KurumsalYasalSlug = (typeof KURUMSAL_YASAL_SLUGS)[number];

export function isKurumsalYasalSlug(slug: string): slug is KurumsalYasalSlug {
  return (KURUMSAL_YASAL_SLUGS as readonly string[]).includes(slug);
}

export function yasalPath(slug: string) {
  const s = slug.replace(/^\/+|\/+$/g, "");
  if (isKurumsalYasalSlug(s)) return `/${s}`;
  return `/yasal/${s}`;
}
