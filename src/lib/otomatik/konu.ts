/**
 * Emekli konusu ve kategori tahmini — ücretsiz, kelime tabanlı.
 * Panelin RSS filtresi gövdede tek bir "SGK" geçse bile eşleşir; Claude'a
 * (ücretli) ya da ham taslağa gitmeden önce bu daha sıkı süzgeç çalışır.
 */

const BASLIK_KONU =
  /emekli|sgk|ssk|ba[gğ]-?kur|\beyt\b|intibak|prim g[uü]n|ayl[ıi]k ba[gğ]la|maa[sş] ba[gğ]la|bayram ikramiye|memur zamm|memur maa[sş]|katsay[ıi]|enflasyon|t[uü]fe|refah pay[ıi]/i;

/** "Emekli general açıklama yaptı" gibi, emekliyi sıfat olarak kullananlar. */
const BASLIK_DISLA =
  /emekli (or|kor|t[uü]m|tu)?general|emekli amiral|emekli albay|emekli b[uü]y[uü]kel[cç]i|emekli futbolcu|emekli hakem/i;

/** "zaman" kelimesine takılmasın: zam, zammı, zamlar, zamlı. */
const ZAM = String.raw`\bzam(?:\b|m[ıi]|lar|l[ıi])`;

const OZNE = /emekli|sgk|ssk|ba[gğ]-?kur/i;
const PARA = new RegExp(String.raw`maa[sş]|${ZAM}|ayl[ıi]k|[oö]deme|promosyon|ikramiye|prim|art[ıi][sş]|enflasyon|hesap|ba[gğ]la`, "i");

export function emekliKonusuMu(baslik: string, govde: string) {
  if (BASLIK_DISLA.test(baslik)) return false;
  if (BASLIK_KONU.test(baslik)) return true;
  // Başlıkta yoksa: en az iki paragraf hem emekliden hem paradan söz etmeli.
  const paragraflar = govde.split(/\n+/).filter((p) => OZNE.test(p) && PARA.test(p));
  return paragraflar.length >= 2;
}

const KATEGORI_KURALLARI: [slug: string, desen: RegExp][] = [
  ["promosyon", /promosyon/i],
  ["ikramiye-ve-odemeler", /ikramiye|[oö]deme|kira yard|yak[ıi]t yard/i],
  ["zam", new RegExp(String.raw`${ZAM}|enflasyon|t[uü]fe|katsay[ıi]|refah pay[ıi]|art[ıi][sş]`, "i")],
  ["sgk", /sgk|ssk|ba[gğ]-?kur|\beyt\b|prim|ayl[ıi]k ba[gğ]la|hizmet d[oö]k/i],
  ["emekli-maasi", /maa[sş]|ayl[ıi]k/i],
];

/** Claude yokken kategori: önce başlığa, sonra gövdeye bakar; yoksa gündem. */
export function kategoriTahmin(baslik: string, govde: string, slugs: string[]) {
  for (const metin of [baslik, govde]) {
    for (const [slug, desen] of KATEGORI_KURALLARI) {
      if (slugs.includes(slug) && desen.test(metin)) return slug;
    }
  }
  return slugs.includes("gundem") ? "gundem" : slugs[0];
}

/** Kapak görseline sığacak uzunlukta başlık. */
export function kapakIcinKisalt(baslik: string, max = 90) {
  const temiz = baslik.replace(/\s+/g, " ").trim();
  if (temiz.length <= max) return temiz;
  const kesik = temiz.slice(0, max);
  return `${kesik.slice(0, kesik.lastIndexOf(" ")).replace(/[,:;–-]+$/, "")}…`;
}

/**
 * Claude yokken özet / meta açıklama: ara başlık ve kısa satırlar atlanır,
 * ilk dolu paragraf cümle sonundan (yoksa kelime sınırından) kesilir.
 */
export function otomatikOzet(govde: string, max = 160) {
  const paragraf = govde
    .split(/\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .find((p) => p.length >= 60 && p !== p.toLocaleUpperCase("tr-TR"));
  if (!paragraf) return null;
  if (paragraf.length <= max) return paragraf;
  const kesik = paragraf.slice(0, max);
  const cumleSonu = Math.max(kesik.lastIndexOf(". "), kesik.lastIndexOf("! "), kesik.lastIndexOf("? "));
  if (cumleSonu >= 80) return kesik.slice(0, cumleSonu + 1);
  return `${kesik.slice(0, kesik.lastIndexOf(" ")).replace(/[,:;–-]+$/, "")}…`;
}

/** Aynı stok fotoğraf havuzunu paylaşan kategoriler (panel ve otomatik hat ortak). */
const ORTAK_HAVUZLAR = [["zam", "emekli-maasi", "ikramiye-ve-odemeler", "promosyon"]];

export function havuzKategorileri(kategori: string) {
  return ORTAK_HAVUZLAR.find((g) => g.includes(kategori)) ?? [kategori];
}
