import {
  KurumsalYasalPage,
  kurumsalYasalMetadata,
} from "@/components/kurumsal-yasal-page";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return kurumsalYasalMetadata("duzeltme");
}

export default function DuzeltmePage() {
  return <KurumsalYasalPage slug="duzeltme" />;
}
