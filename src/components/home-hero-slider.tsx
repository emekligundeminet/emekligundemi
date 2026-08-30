"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type TouchEvent } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CoverMedia } from "@/components/cover-media";
import { articlePath, categoryName } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import { cn } from "@/lib/utils";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

const INTERVAL_MS = 5000;
const SWIPE_PX = 48;

type Props = {
  slides: Article[];
  categories: Category[];
  logoSrc?: string | null;
};

/** Hafif manşet slider: transform + state. Kütüphane yok. */
export function HomeHeroSlider({ slides, categories, logoSrc }: Props) {
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const skipClick = useRef(false);

  const go = useCallback(
    (next: number) => {
      if (n < 1) return;
      setIndex(((next % n) + n) % n);
    },
    [n]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMq = () => setReduceMotion(mq.matches);
    syncMq();
    mq.addEventListener("change", syncMq);

    const syncVis = () => setHidden(document.visibilityState === "hidden");
    syncVis();
    document.addEventListener("visibilitychange", syncVis);

    return () => {
      mq.removeEventListener("change", syncMq);
      document.removeEventListener("visibilitychange", syncVis);
    };
  }, []);

  useEffect(() => {
    if (n < 2 || reduceMotion || paused || hidden) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [n, reduceMotion, paused, hidden]);

  if (n === 0) return null;

  function onTouchStart(e: TouchEvent) {
    const t = e.changedTouches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || n < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return;
    skipClick.current = true;
    go(index + (dx < 0 ? 1 : -1));
  }

  function onClickCapture(e: MouseEvent) {
    if (!skipClick.current) return;
    e.preventDefault();
    e.stopPropagation();
    skipClick.current = false;
  }

  return (
    <div
      className="relative overflow-hidden select-none"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(index - 1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(index + 1);
        }
      }}
      aria-roledescription="carousel"
      aria-label="Manşet"
    >
      <div className="relative aspect-[16/9] w-full">
        <div
          className={cn(
            "absolute inset-0 flex",
            reduceMotion ? "" : "transition-transform duration-500 ease-out"
          )}
          style={{ transform: `translate3d(-${index * 100}%,0,0)` }}
        >
          {slides.map((article, i) => {
            const kicker = categoryName(article, categories);
            return (
              <div
                key={article.id}
                className="relative h-full w-full min-w-full shrink-0"
                aria-hidden={i !== index}
              >
                <Link
                  href={articlePath(article)}
                  tabIndex={i === index ? 0 : -1}
                  className="absolute inset-0"
                >
                  <CoverMedia
                    src={article.cover_url}
                    alt={article.cover_alt || article.title}
                    sizes={IMG_SIZES.heroMain}
                    priority={i === 0}
                    logoSrc={logoSrc}
                    className="h-full w-full"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-4 pb-8 md:p-6 md:pb-10">
                    {kicker ? (
                      <span className="inline-block bg-[var(--brand)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white md:text-xs">
                        {kicker}
                      </span>
                    ) : null}
                    <span className="mt-2 block text-2xl font-extrabold leading-tight text-white md:text-4xl">
                      {article.title}
                    </span>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {n > 1 ? (
        <>
          <button
            type="button"
            aria-label="Önceki manşet"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-black/45 text-white hover:bg-black/65 md:left-3"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            aria-label="Sonraki manşet"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-black/45 text-white hover:bg-black/65 md:right-3"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:bottom-3">
            {slides.map((article, i) => (
              <button
                key={article.id}
                type="button"
                aria-label={`Manşet ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i === index ? "bg-white" : "bg-white/45 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        </>
      ) : null}

    </div>
  );
}
