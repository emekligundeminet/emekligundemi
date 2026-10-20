import { slugify } from "@/lib/slugify";
import type { CekilenHaber } from "@/types/cekilen";

function kacisHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Kaynak sitelerin ara başlıkları düz metne BÜYÜK HARF kısa satır olarak düşer. */
export function araBaslikMi(satir: string) {
  return (
    satir.length <= 90 &&
    /\p{L}/u.test(satir) &&
    !/[.!?:;,]$/.test(satir) &&
    satir === satir.toLocaleUpperCase("tr-TR")
  );
}

/** kaynakSatiri=false: otomatik hat; en üste "Kaynak: …" satırı eklenmez. */
export function govdeToHtml(haber: CekilenHaber, kaynakSatiri = true) {
  const paragraflar = haber.govde
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (araBaslikMi(p) ? `<h2>${kacisHtml(p)}</h2>` : `<p>${kacisHtml(p)}</p>`))
    .join("");
  const kaynak = `<p><em>Kaynak: ${kacisHtml(haber.kaynak)} — <a href="${kacisHtml(haber.link)}">${kacisHtml(haber.link)}</a></em></p>`;
  return kaynakSatiri ? `${kaynak}${paragraflar}` : paragraflar;
}

export function haberSlug(haber: CekilenHaber) {
  const base = slugify(haber.baslik);
  try {
    const son = new URL(haber.link).pathname.match(/p(\d+)/i)?.[1];
    return son ? `${base}-${son}` : base;
  } catch {
    return base;
  }
}
