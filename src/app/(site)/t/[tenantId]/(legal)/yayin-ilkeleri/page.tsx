import {
  KurumsalYasalPage,
  kurumsalYasalMetadata,
} from "@/components/kurumsal-yasal-page";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return kurumsalYasalMetadata("yayin-ilkeleri");
}

export default function YayinIlkeleriPage() {
  return <KurumsalYasalPage slug="yayin-ilkeleri" />;
}
