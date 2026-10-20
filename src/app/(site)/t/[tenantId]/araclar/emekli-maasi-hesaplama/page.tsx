import { CalcToolPage } from "@/components/calc-tool-page";
import { PensionTool } from "@/components/pension-tool";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { asNumber, asString } from "@/lib/hesap-formulas";
import { getParams } from "@/lib/hesap-params";
import { seoEmekliMaasi } from "@/lib/hesap-seo";
import { PENSION_TOOL_PATH, SITE_NAME } from "@/lib/site";
import { absolutePath } from "@/lib/site-meta";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return [] as { tenantId: string }[];
}

type Params = { tenantId: string };

const DESC =
  "Prim gününüz ve brüt kazancınızla tahmini emekli maaşınızı üç adımda hesaplayın.";


export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId } = await params;
  const site = await cachedSiteMeta(tenantId);
  const siteName = site?.name ?? SITE_NAME;
  const origin = site?.origin;
  const canonical = origin ? absolutePath(origin, PENSION_TOOL_PATH) : PENSION_TOOL_PATH;
  const title = "Emekli Maaşı Hesaplama 2026";
  return {
    title: { absolute: `${title} | Emekliler.org` },
    description: DESC,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName,
      title,
      description: DESC,
      url: canonical,
    },
    twitter: {
      card: "summary",
      title,
      description: DESC,
    },
  };
}

export default async function PensionToolPage({ params }: { params: Promise<Params> }) {
  const { tenantId } = await params;
  const [site, blog, kat, map] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId),
    cachedCategoryPage(tenantId, "emekli-maasi"),
    getParams(),
  ]);
  if (!site) notFound();

  const canonical = absolutePath(site.origin, PENSION_TOOL_PATH);
  const taban = asNumber(map.en_dusuk_emekli_ayligi) ?? 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Emekli Maaşı Hesaplama",
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    url: canonical,
    description: DESC,
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: { "@type": "ImageObject", url: site.logoUrl },
    },
  };

  return (
    <CalcToolPage
      title="Emekli Maaşı Hesaplama"
      lead={DESC}
      seo={asString(map.seo_emekli_maasi) || seoEmekliMaasi(map)}
      jsonLd={jsonLd}
      currentPath={PENSION_TOOL_PATH}
      relatedNews={kat?.articles ?? []}
      relatedGuides={blog.articles}
      logoSrc={site.logoUrl}
    >
      <PensionTool taban={taban} />
    </CalcToolPage>
  );
}
