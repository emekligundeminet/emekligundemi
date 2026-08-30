"use client";

import { EXTERNAL_NOFOLLOW } from "@/components/site-social";
import { useState } from "react";

const SIZES = ["sm", "md", "lg"] as const;
type Size = (typeof SIZES)[number];

function shareFb(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

function shareWa(url: string, title: string) {
  return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
}

type Props = {
  title: string;
  url: string;
};

/** Paylaşım + gövde yazı boyutu (oturum içi). */
export function ArticleToolbar({ title, url }: Props) {
  const [size, setSize] = useState<Size>("md");

  function apply(next: Size) {
    setSize(next);
    const root = document.getElementById("haber-govde");
    if (root) root.setAttribute("data-fs", next);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <a
          href={shareFb(url)}
          target="_blank"
          rel={EXTERNAL_NOFOLLOW}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-black"
          aria-label="Facebook'ta paylaş"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 4.99 3.66 9.13 8.44 9.88v-6.99H7.9v-2.89h2.4V9.41c0-2.38 1.41-3.69 3.57-3.69 1.03 0 2.12.18 2.12.18v2.34h-1.2c-1.18 0-1.55.73-1.55 1.48v1.78h2.64l-.42 2.89h-2.22v6.99c4.78-.75 8.44-4.89 8.44-9.88Z" />
          </svg>
        </a>
        <a
          href={shareWa(url, title)}
          target="_blank"
          rel={EXTERNAL_NOFOLLOW}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 hover:border-neutral-900 hover:text-black"
          aria-label="WhatsApp'ta paylaş"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.02Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.83c0 4.55-3.7 8.23-8.25 8.23Zm4.51-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.4-.12-.56.12-.17.25-.64.8-.79.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.17-.48-.29Z" />
          </svg>
        </a>
      </div>
      <div
        className="flex items-center overflow-hidden rounded-md border border-neutral-200"
        role="group"
        aria-label="Yazı boyutu"
      >
        <button
          type="button"
          className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center px-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          onClick={() => apply(size === "lg" ? "md" : "sm")}
          disabled={size === "sm"}
          aria-label="Yazıyı küçült"
        >
          A−
        </button>
        <span className="w-px self-stretch bg-neutral-200" aria-hidden />
        <button
          type="button"
          className="inline-flex h-11 min-w-11 cursor-pointer items-center justify-center px-2.5 text-base font-bold text-neutral-900 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-35"
          onClick={() => apply(size === "sm" ? "md" : "lg")}
          disabled={size === "lg"}
          aria-label="Yazıyı büyüt"
        >
          A+
        </button>
      </div>
    </div>
  );
}
