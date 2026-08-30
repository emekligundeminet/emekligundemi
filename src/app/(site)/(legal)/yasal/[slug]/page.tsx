import { LegalPageShell } from "@/components/legal-page-shell";
import { YasalMarkdown } from "@/components/yasal-markdown";
import { getKunye } from "@/lib/kunye";
import { applyYasalTokens, formatYasalTarih, getYasalSayfa } from "@/lib/yasal";
import { SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import { isKurumsalYasalSlug, yasalPath } from "@/types/yasal";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isKurumsalYasalSlug(slug)) permanentRedirect(yasalPath(slug));
  const page = await getYasalSayfa(slug);
  if (!page) return { robots: { index: false, follow: true } };
  const path = yasalPath(page.slug);
  const description = page.baslik;
  return {
    title: { absolute: staticDocumentTitle(page.baslik) },
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_ORIGIN}${path}` },
    openGraph: {
      title: page.baslik,
      description,
      url: `${SITE_ORIGIN}${path}`,
    },
  };
}

export default async function YasalSayfaPage({ params }: Props) {
  const { slug } = await params;
  if (isKurumsalYasalSlug(slug)) permanentRedirect(yasalPath(slug));
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
