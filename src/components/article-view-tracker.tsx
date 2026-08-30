"use client";

import { useEffect } from "react";

/** Haber açılınca bir kez say. Tekrar 24 saat cookie ile API’de kesilir. */
export function ArticleViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    const key = `vb:${slug}`;
    if (sessionStorage.getItem(key)) return;
    fetch(`/api/view/${encodeURIComponent(slug)}`, { method: "POST" })
      .then((res) => {
        if (res.ok) sessionStorage.setItem(key, "1");
      })
      .catch(() => {});
  }, [slug]);
  return null;
}
