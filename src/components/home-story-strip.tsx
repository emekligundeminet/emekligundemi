import Link from "next/link";
import { CoverMedia } from "@/components/cover-media";
import { articlePath, categoryName } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

type Props = {
  articles: Article[];
  categories: Category[];
  logoSrc?: string | null;
  /** Manşet yokken şerit sayfanın en üstünde kalır; ilk kapaklar LCP adayı olur. */
  priorityFirst?: boolean;
};

/** Sözcü şeridi: 4 eşit kart. Mobilde kompakt satır, md+ 4 sütun. */
export function HomeStoryStrip({ articles, categories, logoSrc, priorityFirst }: Props) {
  if (articles.length === 0) return null;

  return (
    <ul className="grid grid-cols-1 gap-3.5 md:grid-cols-4 md:gap-4">
        {articles.map((article, i) => {
          const kicker = categoryName(article, categories);
          return (
            <li key={article.id}>
              <Link
                href={articlePath(article)}
                className="group grid grid-cols-[8.5rem_1fr] items-center gap-3.5 md:block"
              >
                <CoverMedia
                  src={article.cover_url}
                  alt={article.cover_alt || article.title}
                  sizes={IMG_SIZES.strip4}
                  priority={priorityFirst && i < 2}
                  logoSrc={logoSrc}
                  className="aspect-[16/9] w-full"
                />
                <div className="min-w-0">
                  {kicker ? (
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--brand)] md:mt-2 md:text-[11px]">
                      {kicker}
                    </p>
                  ) : null}
                  <p className="mt-0.5 line-clamp-2 text-[15px] font-extrabold leading-snug text-neutral-900 group-hover:text-[var(--brand)] md:mt-1 md:text-[16px]">
                    {article.title}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
    </ul>
  );
}
