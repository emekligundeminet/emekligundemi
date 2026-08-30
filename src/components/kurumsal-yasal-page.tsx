import { LegalPageShell } from "@/components/legal-page-shell";
import { YasalMarkdown } from "@/components/yasal-markdown";
import { getKunye } from "@/lib/kunye";
import { SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import { applyYasalTokens, formatYasalTarih, getYasalSayfa } from "@/lib/yasal";
import { type KurumsalYasalSlug, yasalPath } from "@/types/yasal";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const KURUMSAL_YASAL_META: Record<KurumsalYasalSlug, { description: string }> = {
  "yayin-ilkeleri": {
    description: "Emekliler.org haber ve rehber içeriklerini nasıl üretir.",
  },
  duzeltme: {
    description: "Cevap ve düzeltme (tekzip) başvurusu nasıl yapılır.",
  },
  iletisim: {
    description: "Emekliler.org iletişim bilgileri.",
  },
  reklam: {
    description: "Reklam ve iş birliği, editoryal bağımsızlık.",
  },
};

export async function kurumsalYasalMetadata(slug: KurumsalYasalSlug): Promise<Metadata> {
  const page = await getYasalSayfa(slug);
  const title = page?.baslik ?? slug;
  const description = KURUMSAL_YASAL_META[slug].description;
  const path = yasalPath(slug);
  return {
    title: { absolute: staticDocumentTitle(title) },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_ORIGIN}${path}` },
    openGraph: {
      title,
      description,
      url: `${SITE_ORIGIN}${path}`,
    },
  };
}

export async function KurumsalYasalPage({ slug }: { slug: KurumsalYasalSlug }) {
  const [page, kunye] = await Promise.all([getYasalSayfa(slug), getKunye()]);
  if (!page) notFound();

  return (
    <LegalPageShell
      title={page.baslik}
      updatedAt={page.guncelleme_tarihi ? formatYasalTarih(page.guncelleme_tarihi) : undefined}
    >
      <div className="border-y border-neutral-200 py-4">
        <YasalMarkdown markdown={applyYasalTokens(page.icerik_md, kunye)} />
      </div>
    </LegalPageShell>
  );
}
