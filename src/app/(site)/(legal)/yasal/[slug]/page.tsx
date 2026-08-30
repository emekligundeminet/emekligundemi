import { SitePage } from "@/components/site-page";
import { YasalMarkdown } from "@/components/yasal-markdown";
import { formatYasalTarih, getYasalSayfa } from "@/lib/yasal";
import { SITE_ORIGIN } from "@/lib/site";
import { yasalPath } from "@/types/yasal";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getYasalSayfa(slug);
  if (!page) return { robots: { index: false, follow: true } };
  const path = yasalPath(page.slug);
  const description = `${page.baslik} — Emekliler.org`;
  return {
    title: page.baslik,
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
  const page = await getYasalSayfa(slug);
  if (!page) notFound();

  return (
    <SitePage title={page.baslik}>
      <YasalMarkdown markdown={page.icerik_md} />
      {page.guncelleme_tarihi ? (
        <p className="pt-2 text-sm text-neutral-500">
          Son güncelleme: {formatYasalTarih(page.guncelleme_tarihi)}
        </p>
      ) : null}
    </SitePage>
  );
}
