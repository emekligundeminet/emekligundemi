"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function SiteSearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = q.trim();
    if (!next) {
      router.push("/ara");
      return;
    }
    router.push(`/ara?q=${encodeURIComponent(next)}`);
  }

  return (
    <form onSubmit={onSubmit} role="search" className={compact ? "flex items-center" : "flex w-full max-w-xl gap-2"}>
      <label className="sr-only" htmlFor={compact ? "nav-search" : "page-search"}>
        Haber ara
      </label>
      <input
        id={compact ? "nav-search" : "page-search"}
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Haber ara"
        className={
          compact
            ? "h-11 w-36 rounded-md border border-white/30 bg-white/10 px-3 text-sm text-white placeholder:text-white/70 focus:border-white focus:outline-none md:w-44"
            : "h-11 flex-1 rounded-md border border-neutral-300 px-3 text-[15px] focus:border-neutral-800 focus:outline-none"
        }
      />
      <button
        type="submit"
        className={
          compact
            ? "inline-flex h-11 w-11 items-center justify-center text-white"
            : "inline-flex h-11 items-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white"
        }
        aria-label="Ara"
      >
        <Search className="h-5 w-5" strokeWidth={2.25} />
        {compact ? null : "Ara"}
      </button>
    </form>
  );
}
