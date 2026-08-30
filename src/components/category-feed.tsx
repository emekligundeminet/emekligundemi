import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { CoverMedia } from "@/components/cover-media";
import { FeedPagination } from "@/components/feed-pagination";
import { HomeHero } from "@/components/home-hero";
import { IMG_SIZES } from "@/lib/image-sizes";
import { formatNewsDate } from "@/lib/site";
import type { ArticleCard } from "@/lib/site";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

function ListCard({ card, logoSrc }: { card: ArticleCard; logoSrc?: string | null }) {
  return (
    <article className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-neutral-200 py-4 last:border-b-0 sm:grid-cols-[9rem_1fr] md:grid-cols-1 md:border-b-0 md:py-0">
      <Link href={card.href} className="block">
        <CoverMedia
          src={card.image}
          alt={card.alt}
          className="aspect-[4/3] w-full md:aspect-[16/9]"
          sizes={IMG_SIZES.grid3}
          logoSrc={logoSrc}
        />
      </Link>
      <div className="min-w-0">
        <Link
          href={card.href}
          className="block text-[17px] font-extrabold leading-snug text-neutral-900 hover:text-[var(--brand)] md:mt-3"
        >
          {card.title}
        </Link>
        {card.excerpt ? (
          <p className="mt-1.5 hidden text-[15px] leading-relaxed text-neutral-600 sm:line-clamp-3 md:block">
            {card.excerpt}
          </p>
        ) : null}
        {card.published_at ? (
          <p className="mt-1.5 text-sm text-neutral-500">{formatNewsDate(card.published_at)}</p>
        ) : null}
      </div>
    </article>
  );
}

export function CategoryFeed({
  name,
  slug,
  description,
  featured,
  initialMore,
  total,
  page = 1,
  pageSize = 24,
  basePath,
  logoSrc,
  heroSlides,
  heroSide,
  categories,
}: {
  name: string;
  slug: string;
  description?: string;
  featured: ArticleCard[];
  initialMore: ArticleCard[];
  total: number;
  page?: number;
  pageSize?: number;
  basePath?: string;
  logoSrc?: string | null;
  heroSlides?: Article[];
  heroSide?: Article[];
  categories?: Category[];
}) {
  const hasHero = (heroSlides?.length ?? 0) > 0;
  const [lead, ...restFeatured] = featured;
  const rest = hasHero ? initialMore : [...restFeatured, ...initialMore];
  const empty = !hasHero && featured.length === 0;

  return (
    <div>
      <header className="mb-1">
        <div className="mt-1 flex items-center gap-3 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{name}</h1>
          <span className="h-[2px] w-10 shrink-0 bg-[var(--brand)]" aria-hidden />
        </div>
        {slug === "blog" && description ? (
          <p className="max-w-2xl text-base leading-relaxed text-neutral-600">{description}</p>
        ) : null}
      </header>

      {empty ? (
        <p className="mt-8 text-lg text-neutral-500">Bu kategoride henüz haber yok.</p>
      ) : (
        <>
          {hasHero ? (
            <div className="mt-6">
              <HomeHero
                slides={heroSlides ?? []}
                side={heroSide ?? []}
                categories={categories ?? []}
                logoSrc={logoSrc}
              />
            </div>
          ) : lead ? (
            <article className="mt-6">
              <Link href={lead.href} className="block">
                <CoverMedia
                  src={lead.image}
                  alt={lead.alt}
                  className="aspect-[16/9] w-full"
                  sizes={IMG_SIZES.lcp}
                  priority
                  logoSrc={logoSrc}
                />
              </Link>
              <h2 className="mt-4 text-2xl font-extrabold leading-tight md:text-3xl">
                <Link href={lead.href} className="hover:text-[var(--brand)]">
                  {lead.title}
                </Link>
              </h2>
              {lead.excerpt ? (
                <p className="mt-2 max-w-3xl text-[17px] leading-relaxed text-neutral-600">
                  {lead.excerpt}
                </p>
              ) : null}
              {lead.published_at ? (
                <p className="mt-2 text-sm text-neutral-500">{formatNewsDate(lead.published_at)}</p>
              ) : null}
            </article>
          ) : null}

          <AdSlot placement="feed" />

          {rest.length > 0 ? (
            <section className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((card) => (
                <ListCard key={card.id} card={card} logoSrc={logoSrc} />
              ))}
            </section>
          ) : null}

          <FeedPagination
            basePath={basePath ?? (slug === "blog" ? "/blog" : `/kategori/${slug}`)}
            page={page}
            total={total}
            pageSize={pageSize}
          />
        </>
      )}
    </div>
  );
}
