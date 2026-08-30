import type { Json } from "@/types/db";

export type ScrapeFeed = { name: string; url: string };

export type ScrapeConfig = {
  feeds: ScrapeFeed[];
  include: string[];
  exclude: string[];
};

/** Kayıt yokken kullanılan varsayılan (eski gömülü liste). */
export const DEFAULT_SCRAPE_CONFIG: ScrapeConfig = {
  feeds: [
    { name: "Sözcü Son Dakika", url: "https://www.sozcu.com.tr/feeds-son-dakika" },
    { name: "Sözcü Haberler", url: "https://www.sozcu.com.tr/feeds-haberler" },
  ],
  include: [
    "emekli",
    "SGK",
    "EYT",
    "intibak",
    "prim gün",
    "maaş bağla",
    "aylık bağla",
    "yaşlılık aylığı",
    "BAĞ-KUR",
    "zam",
  ],
  exclude: ["emekli oldu", "futbol", "teknik direktör", "transfer", "hayatını kaybet"],
};

const MAX_FEEDS = 30;
const MAX_WORDS = 200;
const MAX_WORD_LEN = 80;

function asRecord(settings: Json | Record<string, unknown> | null | undefined) {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return settings as Record<string, unknown>;
  }
  return {};
}

function asStringList(value: unknown): string[] | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    return splitKeywords(value);
  }
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitKeywords(raw: string) {
  return raw
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asFeeds(value: unknown): ScrapeFeed[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const feeds: ScrapeFeed[] = [];
  for (const row of value) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const rec = row as Record<string, unknown>;
    const name = typeof rec.name === "string" ? rec.name.trim() : "";
    const url = typeof rec.url === "string" ? rec.url.trim() : "";
    if (!name || !url) continue;
    feeds.push({ name, url });
  }
  return feeds;
}

export function isHttpUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function scrapeConfigFromSettings(
  settings: Json | Record<string, unknown> | null | undefined
): { config: ScrapeConfig; saved: boolean } {
  const rec = asRecord(settings);
  const feeds = asFeeds(rec.scrape_feeds);
  const include = asStringList(rec.scrape_include);
  const exclude = asStringList(rec.scrape_exclude);
  const saved = feeds !== undefined || include !== undefined || exclude !== undefined;
  return {
    saved,
    config: {
      feeds: feeds && feeds.length > 0 ? feeds : DEFAULT_SCRAPE_CONFIG.feeds,
      include: include ?? DEFAULT_SCRAPE_CONFIG.include,
      exclude: exclude ?? DEFAULT_SCRAPE_CONFIG.exclude,
    },
  };
}

export function parseScrapeConfigInput(raw: unknown): ScrapeConfig {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("Geçersiz tarama ayarı.");
  }
  const rec = raw as Record<string, unknown>;
  const feedsIn = asFeeds(rec.feeds) ?? [];
  const include = (asStringList(rec.include) ?? []).slice(0, MAX_WORDS);
  const exclude = (asStringList(rec.exclude) ?? []).slice(0, MAX_WORDS);

  if (feedsIn.length === 0) {
    throw new Error("En az bir RSS kaynağı gerekli.");
  }
  if (feedsIn.length > MAX_FEEDS) {
    throw new Error(`En fazla ${MAX_FEEDS} RSS kaynağı eklenebilir.`);
  }

  const feeds: ScrapeFeed[] = [];
  for (const feed of feedsIn) {
    if (feed.name.length > 80) throw new Error("Kaynak adı çok uzun.");
    if (!isHttpUrl(feed.url)) {
      throw new Error(`Geçersiz RSS adresi: ${feed.url}`);
    }
    feeds.push({ name: feed.name.slice(0, 80), url: feed.url });
  }

  for (const word of [...include, ...exclude]) {
    if (word.length > MAX_WORD_LEN) {
      throw new Error(`Kelime çok uzun: ${word.slice(0, 24)}…`);
    }
  }

  return { feeds, include, exclude };
}

export function scrapeSettingsPatch(config: ScrapeConfig) {
  return {
    scrape_feeds: config.feeds,
    scrape_include: config.include,
    scrape_exclude: config.exclude,
  };
}

function escapeRe(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Düz kelimeler → case-insensitive alt dizgi. Boş liste = filtre yok. */
export function keywordsToRegex(words: string[]): RegExp | null {
  const parts = words.map((w) => w.trim()).filter(Boolean).map(escapeRe);
  if (parts.length === 0) return null;
  return new RegExp(parts.join("|"), "i");
}
