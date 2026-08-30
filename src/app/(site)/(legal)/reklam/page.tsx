import {
  KurumsalYasalPage,
  kurumsalYasalMetadata,
} from "@/components/kurumsal-yasal-page";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return kurumsalYasalMetadata("reklam");
}

export default function ReklamPage() {
  return <KurumsalYasalPage slug="reklam" />;
}
