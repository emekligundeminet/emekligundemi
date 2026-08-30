import { LegalPageShell } from "@/components/legal-page-shell";
import { YasalMarkdown } from "@/components/yasal-markdown";
import { getKunye, kunyeValue } from "@/lib/kunye";
import { SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import { applyYasalTokens, formatYasalTarih, getYasalSayfa } from "@/lib/yasal";
import type { KunyeVeri } from "@/types/kunye";
import {
  type KurumsalYasalSlug,
  yasalPath,
} from "@/types/yasal";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const KURUMSAL_YASAL_META: Record<
  KurumsalYasalSlug,
  { description: string; noticeTitle: string }
> = {
  "yayin-ilkeleri": {
    description: "Emekliler.org haber ve rehber içeriklerini nasıl üretir.",
    noticeTitle: "Hata bildirimi",
  },
  duzeltme: {
    description: "Cevap ve düzeltme (tekzip) başvurusu nasıl yapılır.",
    noticeTitle: "Cevap ve Düzeltme (Tekzip) Başvurusu",
  },
  iletisim: {
    description: "Emekliler.org iletişim bilgileri.",
    noticeTitle: "İletişim",
  },
  reklam: {
    description: "Reklam ve iş birliği, editoryal bağımsızlık.",
    noticeTitle: "Reklam ve iş birliği",
  },
};

export async function kurumsalYasalMetadata(slug: KurumsalYasalSlug): Promise<Metadata> {
  const page = await getYasalSayfa(slug);
  const title = page?.baslik ?? KURUMSAL_YASAL_META[slug].noticeTitle;
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

function noticeFor(slug: KurumsalYasalSlug, kunye: KunyeVeri) {
  const eposta = kunyeValue(kunye, "eposta");
  const uets = kunyeValue(kunye, "uets_adresi");
  const yer = kunyeValue(kunye, "yonetim_yeri");
  if (!eposta && !uets && !yer) return undefined;

  const mail = eposta ? (
    <a href={`mailto:${eposta}`} className="text-[var(--brand)] underline">
      {eposta}
    </a>
  ) : null;

  if (slug === "reklam") {
    if (!mail) return undefined;
    return {
      title: KURUMSAL_YASAL_META.reklam.noticeTitle,
      children: <>Reklam ve iş birliği talepleriniz için {mail} adresine yazabilirsiniz.</>,
    };
  }

  if (slug === "iletisim") {
    return {
      title: KURUMSAL_YASAL_META.iletisim.noticeTitle,
      children: (
        <>
          {mail ? <>E-posta: {mail}</> : null}
          {mail && yer ? <br /> : null}
          {yer ? <>Yönetim yeri: {yer}</> : null}
        </>
      ),
    };
  }

  if (!eposta && !uets) return undefined;
  return {
    title: KURUMSAL_YASAL_META[slug].noticeTitle,
    children: (
      <>
        Yayınlarımıza ilişkin talepleriniz için{" "}
        {mail}
        {eposta && uets ? " / " : null}
        {uets ? <span>UETS: {uets}</span> : null}{" "}
        adresimiz üzerinden başvurabilirsiniz.
      </>
    ),
  };
}

export async function KurumsalYasalPage({ slug }: { slug: KurumsalYasalSlug }) {
  const [page, kunye] = await Promise.all([getYasalSayfa(slug), getKunye()]);
  if (!page) notFound();

  return (
    <LegalPageShell
      title={page.baslik}
      notice={noticeFor(slug, kunye)}
      updatedAt={page.guncelleme_tarihi ? formatYasalTarih(page.guncelleme_tarihi) : undefined}
    >
      <div className="border-y border-neutral-200 py-4">
        <YasalMarkdown markdown={applyYasalTokens(page.icerik_md, kunye)} />
      </div>
    </LegalPageShell>
  );
}
