import { NotFoundBody } from "@/components/not-found-body";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Sayfa bulunamadı | Emekliler.org" },
  robots: { index: false, follow: true },
};

/** ISR sayfalar headers() göremez — chrome tenant/legal layout’tan gelir. */
export default function SiteNotFound() {
  return <NotFoundBody />;
}
