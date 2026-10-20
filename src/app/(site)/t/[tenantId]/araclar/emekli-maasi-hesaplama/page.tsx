import { CalcToolPage } from "@/components/calc-tool-page";
import { PensionTool } from "@/components/pension-tool";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { asNumber } from "@/lib/hesap-formulas";
import { getParams } from "@/lib/hesap-params";
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

const SEO = `
Emekli maaşı, ortalama aylık kazancınızın "aylık bağlama oranı" ile çarpılmasıyla
bulunur. 1 Ekim 2008'den sonra ilk kez sigortalı olanlar için bu oran 5510 sayılı
Kanuna göre her 360 prim günü için yüzde 2'dir ve en fazla yüzde 90 olabilir.
Örneğin 7.200 prim günü (20 yıl) olan birinin oranı yüzde 40'tır; ortalama brüt
kazancı 75.000 TL ise emekli aylığı yaklaşık 30.000 TL olur. Hesaplanan tutar en
düşük emekli aylığının altında kalırsa en düşük aylık ödenir; Temmuz 2026'dan
itibaren bu tutar 23.552 TL'dir.

Araç, kazancı bugünkü parayla girmenizi ister. SGK geçmiş yıllardaki kazançları
enflasyon ve büyüme oranıyla bugüne taşıdığı için bu yaklaşım sonucu gerçeğe
yaklaştırır, ancak kesin hesap yerine geçmez.

İlk sigorta girişi Ekim 2008'den önce olanların aylığı, 2000 öncesi ve 2000–2008
dönemleri için farklı oranlarla, dönemlere bölünerek hesaplanır. Bu kişiler için
araç yalnızca yaklaşık bir fikir verir. Emekli olabilmek için ayrıca yaş ve prim
günü şartlarının sağlanması gerekir. Kesin tutarı emeklilik başvurusundan sonra
SGK hesaplar.
`.replace(/\s+/g, " ").trim();

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
      seo={SEO}
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
