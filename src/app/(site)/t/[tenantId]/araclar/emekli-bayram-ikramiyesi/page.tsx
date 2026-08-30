import { CalcToolPage } from "@/components/calc-tool-page";
import { IkramiyeTool } from "@/components/ikramiye-tool";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { asString } from "@/lib/hesap-formulas";
import { getParams } from "@/lib/hesap-params";
import { SEO_IKRAMIYE } from "@/lib/hesap-seo";
import { absolutePath } from "@/lib/site-meta";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const PATH = "/araclar/emekli-bayram-ikramiyesi";
const TITLE = "Emekli Bayram İkramiyesi";
const DESC = "Güncel bayram ikramiyesi tutarı, ödeme tarihi ve bayrama kalan gün.";

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
  return {
    title: { absolute: `${TITLE} | Emekliler.org` },
    description: DESC,
    alternates: { canonical: site ? absolutePath(site.origin, PATH) : PATH },
  };
}

export default async function IkramiyePage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const [site, blog, kat, map] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId),
    cachedCategoryPage(tenantId, "ikramiye-ve-odemeler"),
    getParams(),
  ]);
  if (!site) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: TITLE,
    description: DESC,
    step: [
      { "@type": "HowToStep", text: "Güncel ikramiye tutarını panel parametresinden okuyun." },
      { "@type": "HowToStep", text: "Bayram ve ödeme tarihine göre kalan günü kontrol edin." },
    ],
    url: absolutePath(site.origin, PATH),
  };

  return (
    <CalcToolPage
      title={TITLE}
      lead={DESC}
      seo={asString(map.seo_ikramiye) || SEO_IKRAMIYE}
      jsonLd={jsonLd}
      currentPath={PATH}
      relatedNews={kat?.articles ?? []}
      relatedGuides={blog.articles}
      logoSrc={site.logoUrl}
    >
      <IkramiyeTool params={map} />
    </CalcToolPage>
  );
}
