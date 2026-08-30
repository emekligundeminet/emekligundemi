"use client";

import { useEffect, useState } from "react";
import { AdIns } from "@/components/ad-ins";
import { adsenseClientId, adsenseSlotId } from "@/lib/ads";
import { CONSENT_COOKIE, allowsMarketing, parseConsent } from "@/lib/consent";
import { cn } from "@/lib/utils";

export type AdPlacement = "in-article" | "feed" | "sidebar";

const HEIGHT: Record<AdPlacement, string> = {
  // Mobil kutu; md'de yatay bant. Reklam boş gelse bile yükseklik durur.
  "in-article": "min-h-[250px] md:min-h-[90px]",
  feed: "min-h-[250px]",
  sidebar: "min-h-[250px]",
};

type Props = {
  placement: AdPlacement;
  className?: string;
};

/**
 * AdSense rezerve alan. ID yokken gizli (yükseklik 0) — yayında boş kutu bırakmaz.
 * NEXT_PUBLIC_ADSENSE_CLIENT + SLOT dolunca min-height kilitlenir; içerik zıplamaz.
 */
export function AdSlot({ placement, className }: Props) {
  const client = adsenseClientId();
  const slot = adsenseSlotId();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function sync() {
      const raw = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
        ?.split("=")[1];
      setAllowed(allowsMarketing(parseConsent(raw)));
    }
    sync();
    window.addEventListener("emekliler-consent", sync);
    return () => window.removeEventListener("emekliler-consent", sync);
  }, []);

  if (!client || !allowed) {
    return (
      <div
        className="ad-slot-idle"
        data-placement={placement}
        hidden
        aria-hidden
      />
    );
  }

  return (
    <aside
      className={cn(
        "ad-slot flex w-full items-center justify-center overflow-hidden",
        HEIGHT[placement],
        placement === "sidebar" ? "my-4" : "my-6",
        className
      )}
      data-placement={placement}
      aria-label="Reklam"
    >
      <AdIns client={client} slot={slot} />
    </aside>
  );
}
