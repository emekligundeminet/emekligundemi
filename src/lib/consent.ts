export const CONSENT_COOKIE = "emekliler_consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;

export type ConsentChoice = "all" | "necessary";

export function parseConsent(value: string | null | undefined): ConsentChoice | null {
  if (value === "all" || value === "necessary") return value;
  return null;
}

export function allowsMarketing(choice: ConsentChoice | null): boolean {
  return choice === "all";
}
