"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { articlePath } from "@/lib/site";
import type { Article } from "@/types/article";

const ROTATE_MS = 4500;

/** Tam genişlik --brand şerit. Haber yoksa yok. */
export function BreakingNewsBar({ articles }: { articles: Article[] }) {
  const items = articles.slice(0, 5);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (items.length < 2 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [items.length, reduceMotion]);

  if (items.length === 0) return null;
  const current = items[reduceMotion ? 0 : index] ?? items[0];

  return (
    <div className="breaking-bar">
      <p className="breaking-label">Son dakika</p>
      <div className="breaking-news">
        <Link href={articlePath(current)} className="breaking-headline">
          {current.title}
        </Link>
      </div>
    </div>
  );
}
