export type YasalSayfa = {
  slug: string;
  baslik: string;
  icerik_md: string;
  guncelleme_tarihi: string;
  yayinda: boolean;
};

export function yasalPath(slug: string) {
  return `/yasal/${slug.replace(/^\/+|\/+$/g, "")}`;
}
