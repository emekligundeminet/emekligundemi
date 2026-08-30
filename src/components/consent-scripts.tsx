"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { adsenseClientId, gaMeasurementId } from "@/lib/ads";
import { CONSENT_COOKIE, allowsMarketing, parseConsent } from "@/lib/consent";

function currentConsent() {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
    ?.split("=")[1];
  return parseConsent(raw);
}

/** GA / AdSense yalnızca açık onaydan sonra. */
export function ConsentScripts() {
  const [allowed, setAllowed] = useState(false);
  const adsense = adsenseClientId();
  const ga = gaMeasurementId();

  useEffect(() => {
    const sync = () => setAllowed(allowsMarketing(currentConsent()));
    sync();
    window.addEventListener("emekliler-consent", sync);
    return () => window.removeEventListener("emekliler-consent", sync);
  }, []);

  if (!allowed) return null;

  return (
    <>
      {adsense ? (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      ) : null}
      {ga ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      ) : null}
    </>
  );
}
