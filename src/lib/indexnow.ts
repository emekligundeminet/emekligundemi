import { SITE_ORIGIN } from "@/lib/site";

/** Public key — /{key}.txt ile IndexNow doğrulanır. */
export const INDEXNOW_KEY = "e6a1c0d4b8f24e7a9c1d5e6f7a8b9c0d";

function hostFromOrigin(origin: string) {
  try {
    return new URL(origin).host;
  } catch {
    return "emekliler.org";
  }
}

/** Yayın sonrası Bing/Yandex/IndexNow. Hata yutulur; sayfa cevabını bekletmez. */
export function pingIndexNow(paths: string[], origin = SITE_ORIGIN) {
  const host = hostFromOrigin(origin);
  const urls = [...new Set(paths)]
    .filter(Boolean)
    .map((p) => (p.startsWith("http") ? p : `${origin.replace(/\/$/, "")}${p.startsWith("/") ? p : `/${p}`}`))
    .slice(0, 20);
  if (urls.length === 0) return;
  void fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  }).catch(() => undefined);
}
