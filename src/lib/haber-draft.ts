import { slugify } from "@/lib/slugify";
import type { CekilenHaber } from "@/types/cekilen";

function kacisHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function govdeToHtml(haber: CekilenHaber) {
  const paragraflar = haber.govde
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${kacisHtml(p)}</p>`)
    .join("");
  const kaynak = `<p><em>Kaynak: ${kacisHtml(haber.kaynak)} — <a href="${kacisHtml(haber.link)}">${kacisHtml(haber.link)}</a></em></p>`;
  return `${kaynak}${paragraflar}`;
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
