/** Feed sayfa numarası. Query (`?sayfa=`) değil path (`/sayfa/2`) — ISR uyumlu. */

export function parseFeedPage(raw: string | undefined): number | null {
  if (raw == null || raw === "") return null;
  if (!/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

export function feedPagePath(basePath: string, page: number): string {
  const base = (basePath.startsWith("/") ? basePath : `/${basePath}`).replace(/\/$/, "") || "/";
  if (page <= 1) return base;
  return `${base}/sayfa/${page}`;
}

const FEED_INDEX =
  /^\/(?:blog|kategori\/[^/]+|yazar\/[^/]+|arsiv\/\d{4}\/\d{1,2})\/?$/;

/** Eski `?sayfa=` → path. Eşleşmezse null (yönlendirme yok). */
export function sayfaQueryRedirectPath(
  pathname: string,
  sayfaRaw: string | null
): string | null {
  if (sayfaRaw === null) return null;
  const path = pathname.replace(/\/$/, "") || "/";
  if (!FEED_INDEX.test(path)) return null;
  return feedPagePath(path, parseFeedPage(sayfaRaw) ?? 1);
}
