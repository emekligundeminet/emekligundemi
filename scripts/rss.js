// npm install rss-parser cheerio
// package.json içinde "type": "module" olmalı (import sözdizimi için)
// Çalıştır: node index.js  →  tarayıcıda http://localhost:3000

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { exec } from "node:child_process";
import Parser from "rss-parser";
import * as cheerio from "cheerio";

const parser = new Parser();
const PORT = 3000;
const KOK = dirname(fileURLToPath(import.meta.url));

const FEEDS = [
  { name: "Sözcü Son Dakika", url: "https://www.sozcu.com.tr/feeds-son-dakika" },
  { name: "Sözcü Haberler", url: "https://www.sozcu.com.tr/feeds-haberler" },
];

const OLUMLU =
  /emekli|SGK|EYT|intibak|prim gün|maaş bağla|aylık bağla|yaşlılık aylığı|BAĞ-?KUR|zam/i;
const NEGATIF = /emekli oldu|futbol|teknik direktör|transfer|hayatını kaybet/i;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function eslesiyor(baslik, govde) {
  const metin = `${baslik ?? ""} ${govde ?? ""}`;
  return OLUMLU.test(metin) && !NEGATIF.test(metin);
}

async function govdeCek(url) {
  const res = await fetch(url, {
    headers: HEADERS,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const el = $("[property='articleBody'], .article-body").first();
  const parcalar = [];
  el.find("p, h2, h3").each((_, node) => {
    const t = $(node).text().replace(/\s+/g, " ").trim();
    if (t) parcalar.push(t);
  });
  return parcalar.join("\n\n") || el.text().replace(/\s+/g, " ").trim();
}

async function tara() {
  const gorulen = new Set();
  const sonuclar = [];
  let tarandi = 0;

  for (const feed of FEEDS) {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = parsed.items ?? [];
      console.log(`[OK] ${feed.name}: RSS'ten ${items.length} haber`);

      for (const item of items) {
        const link = item.link ?? "";
        if (!link || gorulen.has(link)) continue;
        gorulen.add(link);

        let govde = "";
        try {
          govde = await govdeCek(link);
          tarandi += 1;
        } catch (err) {
          console.error(`[HATA] Gövde alınamadı (${link}): ${err.message}`);
          continue;
        }

        if (!eslesiyor(item.title, govde)) continue;

        sonuclar.push({
          kaynak: feed.name,
          baslik: item.title ?? "(başlık yok)",
          tarih: item.pubDate ?? item.isoDate ?? "-",
          link,
          govde,
        });
      }
    } catch (err) {
      console.error(`[HATA] ${feed.name} (${feed.url}): ${err.message}`);
    }
  }

  console.log(`Toplam ${sonuclar.length} haber bulundu.`);
  return {
    haberler: sonuclar,
    tarandi,
    mesaj: `${tarandi} haber sayfası okundu, ${sonuclar.length} eşleşme.`,
  };
}

let onbellek = null;
let taramaPromise = null;

function taramaAl(yenile) {
  if (yenile) {
    onbellek = null;
    taramaPromise = null;
  }
  if (onbellek) return Promise.resolve(onbellek);
  if (!taramaPromise) {
    taramaPromise = tara()
      .then((data) => {
        onbellek = data;
        return data;
      })
      .finally(() => {
        taramaPromise = null;
      });
  }
  return taramaPromise;
}

const sunucu = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${PORT}`);

  if (url.pathname === "/api/haberler") {
    try {
      const data = await taramaAl(url.searchParams.get("yenile") === "1");
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ hata: err.message }));
    }
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    try {
      const html = await readFile(join(KOK, "public", "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    } catch {
      res.writeHead(404);
      res.end("index.html bulunamadı");
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

sunucu.listen(PORT, () => {
  const adres = `http://localhost:${PORT}`;
  console.log(`Arayüz: ${adres}`);
  exec(`open "${adres}"`);
  taramaAl(false);
});
