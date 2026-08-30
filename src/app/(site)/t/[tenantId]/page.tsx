import { BreakingNewsBar } from "@/components/breaking-news-bar";
import { CategorySection } from "@/components/category-section";
import { HomeHero } from "@/components/home-hero";
import { HomeStoryStrip } from "@/components/home-story-strip";
import { MostRead } from "@/components/most-read";
import { AdSlot } from "@/components/ad-slot";
import { isReservedBlogIndexSlug } from "@/lib/content-type";
import { jsonLdScript, organizationJsonLd, websiteJsonLd } from "@/lib/json-ld";
import { BLOG_INDEX_PATH, BLOG_INDEX_TITLE, BRAND_LOGO, HOME_TITLE, SITE_TAGLINE, TITLE_SUFFIX, categorySlugOf } from "@/lib/site";
import { cachedBlogArticles, cachedCategories, cachedHomeArticles, cachedSiteMeta } from "@/lib/cached-public";
import { notFound } from "next/navigation";
import type { Article } from "@/types/article";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

type Params = { tenantId: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tenantId } = await params;
  const site = await cachedSiteMeta(tenantId);
  const title = `${HOME_TITLE} | ${TITLE_SUFFIX}`;
  const description = site?.description ?? SITE_TAGLINE;
  const url = site?.origin;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url ?? "/" },
    openGraph: {
      type: "website",
      siteName: site?.name,
      title,
      description,
      url,
      images: [{ url: BRAND_LOGO.onRed, alt: HOME_TITLE }],
    },
  };
}

/** 4 kart: manşet. Slider: en yeni. Yan: 2 kart (slider 5 alıp yanı boş bırakmasın). */
function splitHomeArticles(articles: Article[]) {
  const cards = articles
    .filter((a) => a.is_manset)
    .sort(
      (a, b) =>
        (b.published_at ?? "").localeCompare(a.published_at ?? "") || b.id.localeCompare(a.id)
    )
    .slice(0, 4);
  const cardIds = new Set(cards.map((a) => a.id));
  const rest = articles.filter((a) => !cardIds.has(a.id));
  const sideCount = rest.length >= 3 ? 2 : 0;
  const sliderN = Math.min(5, Math.max(0, rest.length - sideCount));
  const slider = rest.slice(0, sliderN);
  const side = rest.slice(sliderN, sliderN + sideCount);
  return { slider, cards, side };
}

export default async function HomePage({ params }: { params: Promise<Params> }) {
  const { tenantId } = await params;
  if (!tenantId) notFound();

  const [articles, categories, site, blogFeed] = await Promise.all([
    cachedHomeArticles(tenantId),
    cachedCategories(tenantId),
    cachedSiteMeta(tenantId),
    cachedBlogArticles(tenantId),
  ]);

  const logoSrc = site?.logoUrl ?? null;
  const { slider, cards, side } = splitHomeArticles(articles);
  const usedIds = new Set([...slider, ...cards, ...side].map((a) => a.id));
  const breaking = articles.filter((a) => a.is_breaking).slice(0, 5);

  /** Üst bloklarla çakışmasın; kategori boşalırsa o kategorinin haberini yine göster. */
  const categoryBlocks: { kat: (typeof categories)[number]; items: Article[] }[] = [];
  for (const kat of categories) {
    if (isReservedBlogIndexSlug(kat.slug)) continue;
    if (categoryBlocks.length >= 3) break;
    const inCat = articles.filter((a) => categorySlugOf(a, categories) === kat.slug);
    const unique = inCat.filter((a) => !usedIds.has(a.id));
    const items = (unique.length >= 1 ? unique : inCat).slice(0, 5);
    if (items.length < 1) continue;
    categoryBlocks.push({ kat, items });
  }

  const mostRead = [...articles]
    .filter((a) => a.view_count > 0)
    .sort((a, b) => b.view_count - a.view_count || (b.published_at ?? "").localeCompare(a.published_at ?? ""))
    .slice(0, 5);

  const org = site
    ? jsonLdScript([
        organizationJsonLd({
          name: site.name,
          origin: site.origin,
          logoUrl: site.logoUrl,
          description: site.description,
        }),
        websiteJsonLd({
          name: site.name,
          origin: site.origin,
          description: site.description,
        }),
      ])
    : null;

  return (
    <div>
      {org ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: org }} />
      ) : null}
      <h1 className="sr-only">{site?.name ?? "Haberler"}</h1>
      {articles.length === 0 ? (
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <div className="border border-dashed border-neutral-200 px-6 py-16">
            <p className="text-2xl font-bold">Henüz yayınlanmış haber yok</p>
            <p className="mt-2 text-base text-neutral-500">
              Admin panelden bir haberi yayınladığınızda manşet burada görünür.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mx-auto max-w-6xl px-4 py-4 md:py-5">
            <BreakingNewsBar articles={breaking} />
            <div className="mt-4 flex flex-col">
              {cards.length > 0 ? (
                <div
                  className={
                    slider.length > 0 || side.length > 0
                      ? "order-2 mt-5 md:order-1 md:mt-0"
                      : undefined
                  }
                >
                  <HomeStoryStrip articles={cards} categories={categories} logoSrc={logoSrc} />
                </div>
              ) : null}

              {slider.length > 0 || side.length > 0 ? (
                <div className={cards.length > 0 ? "order-1 md:order-2 md:mt-6" : undefined}>
                  <HomeHero
                    slides={slider}
                    side={side}
                    categories={categories}
                    logoSrc={logoSrc}
                  />
                </div>
              ) : null}
            </div>

            <AdSlot placement="feed" />

            {categoryBlocks.map(({ kat, items }) => (
              <CategorySection
                key={kat.id}
                category={kat}
                articles={items}
                logoSrc={logoSrc}
                title={kat.slug === "zam" ? "Emekli Zam Haberleri" : undefined}
              />
            ))}

            {blogFeed.articles.length > 0 ? (
              <CategorySection
                category={{
                  id: "blog-home",
                  tenant_id: tenantId,
                  name: BLOG_INDEX_TITLE,
                  slug: "blog",
                  sort_order: 0,
                }}
                articles={blogFeed.articles.slice(0, 5)}
                href={BLOG_INDEX_PATH}
                logoSrc={logoSrc}
              />
            ) : null}

            {mostRead.length > 0 ? (
              <div className="mt-10 md:mt-12">
                <MostRead articles={mostRead} />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
