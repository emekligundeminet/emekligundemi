/** Reklam/analytics public env. ID yoksa altyapı idle (script ve ins yok). */

export function adsenseClientId(): string | undefined {
  const v = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim();
  return v || undefined;
}

export function adsenseSlotId(): string | undefined {
  const v = process.env.NEXT_PUBLIC_ADSENSE_SLOT?.trim();
  return v || undefined;
}

export function gaMeasurementId(): string | undefined {
  const v = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return v || undefined;
}
