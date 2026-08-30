/** Tek instance bellek. Vercel’de kaba koruma; paylaşımlı store yok. */
const buckets = new Map<string, { n: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || now >= hit.resetAt) {
    buckets.set(key, { n: 1, resetAt: now + windowMs });
    return true;
  }
  if (hit.n >= limit) return false;
  hit.n += 1;
  return true;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}
