import { CalcToolPage } from "@/components/calc-tool-page";
import { ZamTool } from "@/components/zam-tool";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { getParams } from "@/lib/hesap-params";
import { seoZam } from "@/lib/hesap-seo";
import { asString } from "@/lib/hesap-formulas";
import { absolutePath } from "@/lib/site-meta";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const PATH = "/araclar/emekli-zam-hesaplama";
const TITLE = "Emekli Zam Hesaplama";
const DESC =
  "SSK, Bağ-Kur ve memur emeklisi: yeni zamla aylığınızın ne kadar olacağını iki adımda öğrenin.";

export function generateStaticParams() {
  return [] as { tenantId: string }[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}): Promise<Metadata> {
  const { tenantId } = await params;
  const site = await cachedSiteMeta(tenantId);
  const origin = site?.origin;
  return {
    title: { absolute: `${TITLE} | Emekliler.org` },
    description: DESC,
    alternates: { canonical: origin ? absolutePath(origin, PATH) : PATH },
  };
}

export default async function EmekliZamPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const [site, blog, kat, map] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId),
    cachedCategoryPage(tenantId, "emekli-maasi"),
    getParams(),
  ]);
  if (!site) notFound();
  const seo = asString(map.seo_zam) || seoZam(map);
  const canonical = absolutePath(site.origin, PATH);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Emekli zammı nasıl hesaplanır?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SSK ve Bağ-Kur emeklilerinin zammı önceki altı ayın TÜFE artışı kadardır; mevcut aylık bu oranla artırılır. En düşük aylık alanların artışı ayrı yasal düzenlemeyle belirlenir.",
        },
      },
      {
        "@type": "Question",
        name: "SSK ve memur zammı aynı mı?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hayır. Memur emeklisinin zammı, enflasyon farkı ile yeni dönem toplu sözleşme zammının birleşimidir; bu yüzden SSK ve Bağ-Kur oranından farklı olur.",
        },
      },
    ],
    publisher: { "@type": "Organization", name: site.name },
    url: canonical,
  };

  return (
    <CalcToolPage
      title={TITLE}
      lead={DESC}
      seo={seo}
      jsonLd={jsonLd}
      currentPath={PATH}
      relatedNews={kat?.articles ?? []}
      relatedGuides={blog.articles}
      logoSrc={site.logoUrl}
    >
      <ZamTool params={map} />
    </CalcToolPage>
  );
}
