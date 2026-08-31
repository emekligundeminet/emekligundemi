"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  parseConsent,
  type ConsentChoice,
} from "@/lib/consent";

function readCookie(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];
  return parseConsent(raw);
}

function writeCookie(value: ConsentChoice) {
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE}; Path=/; SameSite=Lax`;
  window.dispatchEvent(new Event("emekliler-consent"));
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readCookie() === null);
  }, []);

  if (!open) return null;

  function choose(value: ConsentChoice) {
    writeCookie(value);
    setOpen(false);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-neutral-200 bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      role="region"
      aria-label="Çerez tercihi"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-[15px] leading-relaxed text-neutral-700">
          Zorunlu çerezler siteyi çalıştırır. Ölçüm ve reklam çerezleri yalnızca
          onayınızla yüklenir.{" "}
          <Link href="/yasal/cerez-politikasi" className="underline hover:text-[var(--brand)]">
            Çerez politikası
          </Link>
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => choose("necessary")}
            className="min-h-11 cursor-pointer rounded-md border border-neutral-300 px-4 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            Sadece gerekli
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="min-h-11 cursor-pointer rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:opacity-90"
          >
            Tümünü kabul et
          </button>
        </div>
      </div>
    </div>
  );
}
