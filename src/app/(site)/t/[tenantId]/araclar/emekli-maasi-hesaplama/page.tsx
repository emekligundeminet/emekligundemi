import { ArticleMansetStrip, articlesToMansetCards } from "@/components/article-manset-strip";
import { PensionTool } from "@/components/pension-tool";
import { cachedBlogArticles, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { calcToolsExcept } from "@/lib/calc-tools";
import { articlePath, PENSION_TOOL_PATH, SITE_NAME } from "@/lib/site";
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
  "Prim gününüz ve kazancınıza göre tahmini emekli maaşınızı hesaplayın. Ücretsiz emekli maaşı hesaplama aracı.";

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
  const [site, blog, kat] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId),
    cachedCategoryPage(tenantId, "emekli-maasi"),
  ]);
  if (!site) notFound();

  const canonical = absolutePath(site.origin, PENSION_TOOL_PATH);
  const relatedNews = kat?.articles ?? [];
  const relatedGuides = blog.articles;

  const toolCards = calcToolsExcept(PENSION_TOOL_PATH).map((t) => ({
    key: t.id,
    href: t.path,
    title: t.title,
    coverUrl: t.coverUrl,
    coverAlt: t.coverAlt ?? t.title,
  }));
  const seen = new Set(toolCards.map((c) => c.href));
  const relatedArticles = [...relatedGuides, ...relatedNews].filter((a) => {
    const href = articlePath(a);
    if (seen.has(href)) return false;
    seen.add(href);
    return true;
  });
  const relatedCards = [...toolCards, ...articlesToMansetCards(relatedArticles)].slice(0, 4);

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-[2.1rem]">
          Emekli Maaşı Hesaplama
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-neutral-600">
          Bu araç tahmini sonuç verir. Kesin emekli maaşınız SGK/e-Devlet hesabınızda görünür.
          Hesaplama, kamuya açık SGK formülüne dayanır; kişisel durumunuza göre farklılık
          gösterebilir.
        </p>

        <div className="mt-6">
          <PensionTool />
        </div>

        <section className="mt-10 border-t border-neutral-200 pt-8">
          <h2 className="text-xl font-extrabold text-neutral-900">Nasıl hesaplanır?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">
            Aylık, üç dönemin kısmi tutarının prim günü ağırlığıyla birleşimidir: 2000 öncesi
            (gösterge + aylık bağlama oranı), 2000–Eylül 2008 (kazanç × kademeli ABO), Ekim 2008
            sonrası (kazanç × her 360 gün %2 ABO, tavan %90 — oranlar teyit bekler). Geçmiş kazanç
            güncelleme katsayılarıyla bugüne taşınır. Katsayı tabloları doldurulmadan araç tutar
            üretmez; yanlış kesin rakam gösterilmez. Kesin bağlama SGK / e-Devlet kaydınızdadır.
          </p>
        </section>
      </div>

      <div className="mt-10">
        <ArticleMansetStrip
          label="Hesaplama araçları"
          cards={relatedCards}
          logoSrc={site.logoUrl}
        />
      </div>
    </div>
  );
}
