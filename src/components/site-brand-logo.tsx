"use client";

import { useState } from "react";
import { BRAND_LOGO } from "@/lib/site";

type Variant = "white" | "color" | "onRed" | "mark";

const SRC: Record<Variant, string> = {
  white: BRAND_LOGO.white,
  color: BRAND_LOGO.color,
  onRed: BRAND_LOGO.onRed,
  mark: BRAND_LOGO.favicon,
};

/** Wordmark veya E işareti. Kök SVG; yüklenmezse site adı. */
export function SiteBrandLogo({
  variant,
  siteName,
  className,
}: {
  variant: Variant;
  siteName: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return <span className="text-[1.35rem] font-extrabold tracking-tight">{siteName}</span>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant]}
      alt={siteName}
      width={167}
      height={40}
      className={className}
      onError={() => setBroken(true)}
    />
  );
}
