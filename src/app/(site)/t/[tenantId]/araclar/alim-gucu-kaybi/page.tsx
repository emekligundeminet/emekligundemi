import { AlimGucuTool } from "@/components/alim-gucu-tool";
import { CalcToolPage } from "@/components/calc-tool-page";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { asString } from "@/lib/hesap-formulas";
import { getParams } from "@/lib/hesap-params";
import { SEO_ALIM } from "@/lib/hesap-seo";
import { absolutePath } from "@/lib/site-meta";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const PATH = "/araclar/alim-gucu-kaybi";
const TITLE = "Alım Gücü Kaybı";
const DESC = "Geçmişteki bir tutarın bugünkü karşılığını TÜFE endeksiyle hesaplayın.";

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

export default async function AlimGucuPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const [site, blog, kat, map] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId),
    cachedCategoryPage(tenantId, "zam"),
    getParams(),
  ]);
  if (!site) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: TITLE,
    description: DESC,
    step: [
      { "@type": "HowToStep", text: "Geçmiş ay ve yılı seçin." },
      { "@type": "HowToStep", text: "O günkü tutarı yazın." },
      { "@type": "HowToStep", text: "Bugünkü karşılık = tutar × (güncel endeks / geçmiş endeks)." },
    ],
    url: absolutePath(site.origin, PATH),
  };

  return (
    <CalcToolPage
      title={TITLE}
      lead={DESC}
      seo={asString(map.seo_alim) || SEO_ALIM}
      jsonLd={jsonLd}
      currentPath={PATH}
      relatedNews={kat?.articles ?? []}
      relatedGuides={blog.articles}
      logoSrc={site.logoUrl}
    >
      <AlimGucuTool params={map} />
    </CalcToolPage>
  );
}
