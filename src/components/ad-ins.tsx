"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Props = {
  client: string;
  slot?: string;
};

/** ins + tek push. Script ThirdPartyScripts (lazyOnload) ile gelir. */
export function AdIns({ client, slot }: Props) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Script henüz yoksa veya ağ hatası — rezerve kutu yerinde kalır.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", width: "100%", minHeight: "inherit" }}
      data-ad-client={client}
      data-ad-slot={slot || undefined}
      data-ad-format="rectangle"
      data-full-width-responsive="true"
    />
  );
}
