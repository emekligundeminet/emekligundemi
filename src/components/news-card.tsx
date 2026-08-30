import Link from "next/link";
import { articlePath, excerptFromHtml, formatNewsDate } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import { CoverMedia } from "@/components/cover-media";
import type { Article } from "@/types/article";

type NewsCardProps = {
  article: Article;
  categoryName: string;
  variant: "lead" | "grid" | "row" | "sidebar";
  index?: number;
  logoSrc?: string | null;
};

export function NewsCard({ article, categoryName, variant, index, logoSrc }: NewsCardProps) {
  const href = articlePath(article);
  const alt = article.cover_alt || article.title;

  if (variant === "lead") {
    return (
      <article>
        <Link href={href} className="block">
          <CoverMedia
            src={article.cover_url}
            alt={alt}
            className="aspect-[16/10] w-full"
            sizes={IMG_SIZES.sectionLead}
            logoSrc={logoSrc}
          />
        </Link>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          {categoryName}
        </p>
        <h2 className="mt-1 text-3xl font-extrabold leading-tight md:text-4xl">
          <Link href={href} className="hover:underline">
            {article.title}
          </Link>
        </h2>
        {article.excerpt ? (
          <p className="mt-3 text-[16px] leading-relaxed text-[#5c534b]">
            {excerptFromHtml(article.excerpt, 200)}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-[#8a7f74]">
          {formatNewsDate(article.published_at || article.updated_at)}
        </p>
      </article>
    );
  }

  if (variant === "grid") {
    return (
      <article>
        <Link href={href} className="block">
          <CoverMedia
            src={article.cover_url}
            alt={alt}
            className="aspect-[16/10] w-full"
            sizes={IMG_SIZES.grid3}
            logoSrc={logoSrc}
          />
        </Link>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          {categoryName}
        </p>
        <h3 className="mt-1 text-lg font-extrabold leading-snug">
          <Link href={href} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-[#8a7f74]">
          {formatNewsDate(article.published_at || article.updated_at)}
        </p>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-[#1a1510]/10 py-4 last:border-b-0 md:grid-cols-[11rem_1fr]">
        <Link href={href} className="block">
          <CoverMedia
            src={article.cover_url}
            alt={alt}
            className="aspect-[4/3] w-full"
            sizes={IMG_SIZES.row}
            logoSrc={logoSrc}
          />
        </Link>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
            {categoryName}
          </p>
          <h3 className="mt-1 text-xl font-extrabold leading-snug">
            <Link href={href} className="hover:underline">
              {article.title}
            </Link>
          </h3>
          <p className="mt-1 hidden text-[15px] text-[#5c534b] sm:block">
            {excerptFromHtml(article.excerpt || "", 120)}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="flex gap-3 border-b border-[#1a1510]/10 py-3 last:border-b-0">
      {typeof index === "number" ? (
        <span className="w-6 shrink-0 text-xl font-extrabold text-[var(--brand)]">
          {index + 1}
        </span>
      ) : null}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
          {categoryName}
        </p>
        <h3 className="text-[15px] font-bold leading-snug">
          <Link href={href} className="hover:underline">
            {article.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
