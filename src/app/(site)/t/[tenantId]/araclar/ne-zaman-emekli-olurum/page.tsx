import { CalcToolPage } from "@/components/calc-tool-page";
import { EmeklilikTarihiTool } from "@/components/emeklilik-tarihi-tool";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { getParams } from "@/lib/hesap-params";
import { SEO_EMEKLILIK_TARIHI } from "@/lib/hesap-seo";
import { asString } from "@/lib/hesap-formulas";
import { absolutePath } from "@/lib/site-meta";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const PATH = "/araclar/ne-zaman-emekli-olurum";
const TITLE = "Ne Zaman Emekli Olurum?";
const DESC =
  "SSK, Bağ-Kur ve memur: doğum tarihi, ilk sigorta girişi ve prim gününüzle emeklilik tarihinizi hesaplayın. EYT dahil.";

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
    title: { absolute: `Ne Zaman Emekli Olurum? Emeklilik Tarihi Hesaplama | Emekliler.org` },
    description: DESC,
    alternates: { canonical: origin ? absolutePath(origin, PATH) : PATH },
  };
}

export default async function NeZamanEmekliPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = await params;
  const [site, blog, kat, map] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId),
    cachedCategoryPage(tenantId, "sgk"),
    getParams(),
  ]);
  if (!site) notFound();
  const canonical = absolutePath(site.origin, PATH);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "EYT'li ne zaman emekli olur?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "8 Eylül 1999 ve öncesinde sigortalı olanlar için yaş şartı aranmaz. SSK'lı kadın 20, erkek 25 yıl sigortalılık süresini ve giriş tarihine göre 5000 ile 5975 arasındaki prim gününü doldurunca emekli olur.",
        },
      },
      {
        "@type": "Question",
        name: "2008 sonrası girişliler kaç yaşında emekli olur?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SSK'lılar 7200, Bağ-Kur ve memurlar 9000 prim günüyle kadın 58, erkek 60 yaşında emekli olur. Prim günü 2036'dan sonra tamamlanırsa yaş kademeli olarak 65'e kadar yükselir.",
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
      seo={asString(map.seo_emeklilik_tarihi) || SEO_EMEKLILIK_TARIHI}
      jsonLd={jsonLd}
      currentPath={PATH}
      relatedNews={kat?.articles ?? []}
      relatedGuides={blog.articles}
      logoSrc={site.logoUrl}
    >
      <EmeklilikTarihiTool />
    </CalcToolPage>
  );
}
