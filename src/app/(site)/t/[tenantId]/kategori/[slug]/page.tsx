import { CategoryFeed } from "@/components/category-feed";
import {
  BRAND_LOGO,
  TITLE_SUFFIX,
  categoryMetaDescription,
  categoryMetaTitle,
  staticDocumentTitle,
  toArticleCard,
} from "@/lib/site";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { isReservedBlogIndexSlug } from "@/lib/content-type";
import { cachedCategories, cachedCategoryPage, cachedSiteMeta } from "@/lib/cached-public";
import { notFound, permanentRedirect } from "next/navigation";
import type { Article } from "@/types/article";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

export function generateStaticParams() {
  return [] as { tenantId: string; slug: string }[];
}

type Params = { tenantId: string; slug: string };

/** Anasayfa hero ile aynı: slider (en fazla 5) + 2 yan kart. */
function splitCategoryHero(articles: Article[]) {
  const sideCount = articles.length >= 3 ? 2 : 0;
  const sliderN = Math.min(5, Math.max(0, articles.length - sideCount));
  const slider = articles.slice(0, sliderN);
  const side = articles.slice(sliderN, sliderN + sideCount);
  const rest = articles.slice(sliderN + sideCount);
  return { slider, side, rest };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ sayfa?: string }>;
}): Promise<Metadata> {
  const { tenantId, slug } = await params;
  const { sayfa } = await searchParams;
  const page = Math.max(1, Number(sayfa) || 1);
  if (isReservedBlogIndexSlug(slug)) permanentRedirect("/blog");
  const [site, data] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedCategoryPage(tenantId, slug, page),
  ]);
  if (!data) return {};
  const empty = data.total === 0;
  const path = `/kategori/${data.kat.slug}`;
  const canonical = site
    ? `${site.origin}${path}${page > 1 ? `?sayfa=${page}` : ""}`
    : path;
  const pageName = categoryMetaTitle(data.kat);
  const title = staticDocumentTitle(pageName);
  const description = categoryMetaDescription(data.kat);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    robots: empty || page > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      siteName: TITLE_SUFFIX,
      title: pageName,
      description,
      url: canonical,
      images: [{ url: BRAND_LOGO.onRed, alt: TITLE_SUFFIX }],
    },
    twitter: { card: "summary", title: pageName, description },
  };
}

export default async function KategoriPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ sayfa?: string }>;
}) {
  const { tenantId, slug } = await params;
  const { sayfa } = await searchParams;
  const page = Math.max(1, Number(sayfa) || 1);
  if (isReservedBlogIndexSlug(slug)) permanentRedirect("/blog");
  const [site, data, categories] = await Promise.all([
    cachedSiteMeta(tenantId),
    cachedCategoryPage(tenantId, slug, page),
    cachedCategories(tenantId),
  ]);
  if (!data) notFound();

  const useHero = page === 1;
  const { slider, side, rest } = useHero
    ? splitCategoryHero(data.articles)
    : { slider: [] as Article[], side: [] as Article[], rest: data.articles };
  const description = `${data.kat.name} kategorisindeki güncel haberler.`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {site ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(
              breadcrumbJsonLd(site.origin, [
                { name: "Emekli Haberleri", path: "/" },
                { name: data.kat.name, path: `/kategori/${data.kat.slug}` },
              ])
            ),
          }}
        />
      ) : null}
      <CategoryFeed
        name={data.kat.name}
        slug={data.kat.slug}
        description={description}
        featured={[]}
        initialMore={rest.map(toArticleCard)}
        heroSlides={slider}
        heroSide={side}
        categories={categories.length > 0 ? categories : [data.kat]}
        total={data.total}
        page={page}
        pageSize={data.pageSize}
        logoSrc={site?.logoUrl}
      />
    </div>
  );
}
