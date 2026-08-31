import { NotFoundBody } from "@/components/not-found-body";
import { NOINDEX_FOLLOW_ROBOTS } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Sayfa bulunamadı | Emekliler.org" },
  robots: NOINDEX_FOLLOW_ROBOTS,
};

export default function RootNotFound() {
  return <NotFoundBody />;
}
