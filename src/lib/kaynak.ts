export type Kaynak = {
  /** Görünür metin: "Resmî Gazete (13.07.2026 Cumhurbaşkanı Kararı)" */
  etiket: string;
  url: string;
  /** Varsayılan false = nofollow. Editör bilinçli açmadıkça değişmez. */
  dofollow: boolean;
};

export const KAYNAK_MAX = 12;
const ETIKET_MAX = 160;

/** javascript: / data: gibi şemalar asla render edilmez. */
function safeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/** DB'den ya da istek gövdesinden gelen ham değeri güvenli diziye çevirir. */
export function parseKaynaklar(value: unknown): Kaynak[] {
  const raw = typeof value === "string" ? safeJson(value) : value;
  if (!Array.isArray(raw)) return [];
  const out: Kaynak[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const url = safeUrl(row.url);
    if (!url) continue;
    const etiket =
      typeof row.etiket === "string" && row.etiket.trim()
        ? row.etiket.trim().slice(0, ETIKET_MAX)
        : hostLabel(url);
    out.push({ etiket, url, dofollow: row.dofollow === true });
    if (out.length >= KAYNAK_MAX) break;
  }
  return out;
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/** Etiket boş bırakıldıysa alan adı yeterince açıklayıcı. */
export function hostLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function kaynakRel(dofollow: boolean): string {
  return dofollow ? "noopener noreferrer" : "nofollow noopener noreferrer";
}
