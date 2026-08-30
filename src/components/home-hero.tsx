import Link from "next/link";
import { CoverMedia } from "@/components/cover-media";
import { HomeHeroSlider } from "@/components/home-hero-slider";
import { articlePath, categoryName } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

type Props = {
  slides: Article[];
  side: Article[];
  categories: Category[];
  logoSrc?: string | null;
};

/** Sol 16/9 slider + sağ 2 kart (masaüstünde aynı yükseklik). */
export function HomeHero({ slides, side, categories, logoSrc }: Props) {
  if (slides.length === 0) return null;

  return (
    <section
      className={`grid grid-cols-1 gap-4 ${
        side.length > 0 ? "lg:grid-cols-[minmax(0,2fr)_minmax(16rem,20rem)] lg:items-stretch lg:gap-5" : ""
      }`}
    >
      <HomeHeroSlider slides={slides} categories={categories} logoSrc={logoSrc} />

      {side.length > 0 ? (
        <ul className="hidden flex-col gap-3 lg:flex lg:h-full">
          {side.map((article) => {
            const kicker = categoryName(article, categories);
            return (
              <li key={article.id} className="min-h-0 lg:flex lg:flex-1 lg:flex-col">
                <Link
                  href={articlePath(article)}
                  className="group grid grid-cols-[6.5rem_1fr] items-center gap-3 sm:grid-cols-[7.5rem_1fr] lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:items-stretch"
                >
                  <CoverMedia
                    src={article.cover_url}
                    alt={article.cover_alt || article.title}
                    sizes={IMG_SIZES.heroSide}
                    logoSrc={logoSrc}
                    className="aspect-[4/3] w-full lg:min-h-0 lg:flex-1 lg:aspect-auto"
                  />
                  <div className="min-w-0 lg:shrink-0 lg:pt-2">
                    {kicker ? (
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--brand)]">
                        {kicker}
                      </p>
                    ) : null}
                    <p className="mt-0.5 line-clamp-2 text-[16px] font-bold leading-snug text-neutral-900 group-hover:text-[var(--brand)] md:text-lg">
                      {article.title}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
