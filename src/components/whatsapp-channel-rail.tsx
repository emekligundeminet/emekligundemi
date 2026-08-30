"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { WhatsAppIcon } from "@/components/site-social";

const STORAGE_KEY = "emekliler_wa_rail";
const DELAY_MS = 4500;

function hasConsentChoice() {
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];
  return parseConsent(raw) !== null;
}

/** Soldan kayan kart. Ekranı kilitlemez; kapatınca bir daha çıkmaz. */
export function WhatsAppChannelRail({ href }: { href?: string }) {
  const channel = href?.trim() ?? "";
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!channel) return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return;

    let delayTimer: number | undefined;

    function start() {
      delayTimer = window.setTimeout(() => setOpen(true), DELAY_MS);
    }

    if (hasConsentChoice()) {
      start();
    } else {
      window.addEventListener("emekliler-consent", start, { once: true });
    }

    return () => {
      if (delayTimer) window.clearTimeout(delayTimer);
      window.removeEventListener("emekliler-consent", start);
    };
  }, [channel]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setEntered(false);
    window.setTimeout(() => setOpen(false), 200);
  }

  if (!channel || !open) return null;

  return (
    <aside
      className={`fixed left-3 bottom-28 z-50 w-[min(19.5rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl bg-[#075E54] ring-2 ring-white/40 transition-transform duration-300 ease-out motion-reduce:transition-none ${
        entered ? "translate-x-0" : "-translate-x-[calc(100%+0.75rem)]"
      }`}
      aria-label="WhatsApp kanalı"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-1 top-1 z-10 inline-flex h-11 w-11 cursor-pointer items-center justify-center text-white/80 hover:text-white"
        aria-label="Kapat"
      >
        <X className="h-5 w-5" strokeWidth={2.25} />
      </button>
      <div className="flex items-center gap-3 bg-[#128C7E] px-4 py-3 pr-12">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
          <WhatsAppIcon className="h-6 w-6" />
        </span>
        <p className="text-[16px] font-extrabold leading-tight text-white">WhatsApp kanalı</p>
      </div>
      <div className="px-4 py-3.5">
        <p className="text-[15px] font-bold leading-snug text-white">
          Zam ve ödeme günü haberleri anında gelsin.
        </p>
        <a
          href={channel}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 text-[16px] font-extrabold text-[#054C44] hover:bg-[#2ee075]"
        >
          Kanala katıl
        </a>
      </div>
    </aside>
  );
}
