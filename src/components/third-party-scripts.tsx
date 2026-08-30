import Script from "next/script";
import { adsenseClientId, gaMeasurementId } from "@/lib/ads";

/**
 * Üçüncü parti script stratejisi (render'ı bloklamaz).
 *
 * AdSense aktifleştirmek:
 * 1. .env'e NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-… ve NEXT_PUBLIC_ADSENSE_SLOT=…
 * 2. Bu dosya script'i strategy="lazyOnload" ile yükler (LCP/INP sonrası).
 * 3. <AdSlot /> ID görünce rezerve kutunun içine ins basar.
 *
 * Analytics: NEXT_PUBLIC_GA_MEASUREMENT_ID=G-… → afterInteractive.
 * ID yokken hiçbir script enjekte edilmez.
 */
export function ThirdPartyScripts() {
  const adsense = adsenseClientId();
  const ga = gaMeasurementId();

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
