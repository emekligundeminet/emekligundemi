"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CoverMedia } from "@/components/cover-media";
import { IMG_SIZES } from "@/lib/image-sizes";
import { formatNewsDate } from "@/lib/site";
import type { ArticleCard } from "@/lib/site";

const PAGE_SIZE = 20;

export function GridCard({ card, logoSrc }: { card: ArticleCard; logoSrc?: string | null }) {
  return (
    <article>
      <Link href={card.href} className="group block">
        <CoverMedia
          src={card.image}
          alt={card.alt}
          className="aspect-[16/9] w-full"
          sizes={IMG_SIZES.grid3}
          logoSrc={logoSrc}
        />
      </Link>
      <Link
        href={card.href}
        className="mt-3 block text-[16px] font-extrabold leading-snug text-neutral-900 hover:text-[var(--brand)]"
      >
        {card.title}
      </Link>
      {card.excerpt ? (
        <p className="mt-1.5 line-clamp-3 text-[15px] leading-relaxed text-neutral-500">{card.excerpt}</p>
      ) : null}
      {card.published_at ? (
        <p className="mt-1 text-sm text-neutral-500">{formatNewsDate(card.published_at)}</p>
      ) : null}
    </article>
  );
}

type Props = {
  slug: string;
  endpoint?: string;
  initialCount: number;
  total: number;
  logoSrc?: string | null;
  /** Ekranın altına yaklaşınca kendiliğinden yükle (sonsuz kaydırma). */
  auto?: boolean;
};

/** Yalnızca “daha fazla” — üst ızgara sunucuda render edilir. */
export function CategoryFeedMore({ slug, endpoint, initialCount, total, logoSrc, auto }: Props) {
  const [extra, setExtra] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const loaded = initialCount + extra.length;
  const hasMore = loaded < total;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${endpoint ?? `/api/kategori/${encodeURIComponent(slug)}`}?offset=${loaded}&limit=${PAGE_SIZE}`
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { articles?: ArticleCard[] };
      const next = data.articles ?? [];
      if (next.length === 0) throw new Error("boş");
      setExtra((prev) => [...prev, ...next]);
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  const loadRef = useRef(loadMore);
  loadRef.current = loadMore;

  useEffect(() => {
    const el = sentinel.current;
    if (!auto || failed || !hasMore || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadRef.current();
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [auto, failed, hasMore, extra.length]);

  return (
    <>
      {extra.length > 0 ? (
        <section
          className={`${auto ? "mt-8" : "mt-10"} grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3`}
        >
          {extra.map((card) => (
            <GridCard key={card.id} card={card} logoSrc={logoSrc} />
          ))}
        </section>
      ) : null}
      {hasMore && auto && !failed ? (
        <div ref={sentinel} className="mt-10 flex justify-center text-sm text-neutral-500" aria-live="polite">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Yükleniyor
            </span>
          ) : null}
        </div>
      ) : null}
      {hasMore && (!auto || failed) ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="cursor-pointer rounded-md border border-neutral-900 px-8 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-neutral-900 hover:text-white disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Yükleniyor
              </span>
            ) : (
              "Daha fazla yükle"
            )}
          </button>
        </div>
      ) : null}
    </>
  );
}
