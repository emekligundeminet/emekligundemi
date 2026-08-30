import { CalcToolPage } from "@/components/calc-tool-page";
import { ZamTool } from "@/components/zam-tool";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { getParams } from "@/lib/hesap-params";
import { SEO_ZAM } from "@/lib/hesap-seo";
import { asString } from "@/lib/hesap-formulas";
import { absolutePath } from "@/lib/site-meta";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const PATH = "/araclar/emekli-zam-hesaplama";
const TITLE = "Emekli Zam Hesaplama";
const DESC =
  "SSK, Bağ-Kur ve memur emeklisi zammını hesaplayın. Taban aylık ve senaryo TÜFE dahildir.";

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
  const seo = asString(map.seo_zam) || SEO_ZAM;
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
          text: "Mevcut maaş, dönem zammı ile çarpılır. Sonuç en düşük aylığın altındaysa taban uygulanır.",
        },
      },
      {
        "@type": "Question",
        name: "SSK ve memur zammı aynı mı?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hayır. SSK/Bağ-Kur ile memur emeklisi farklı dönem oranları kullanabilir.",
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
