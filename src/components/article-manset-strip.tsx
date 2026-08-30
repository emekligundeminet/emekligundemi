import Link from "next/link";
import { CoverMedia } from "@/components/cover-media";
import { articlePath } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import type { Article } from "@/types/article";

export type MansetStripCard = {
  key: string;
  href: string;
  title: string;
  coverUrl?: string | null;
  coverAlt?: string | null;
};

export function articlesToMansetCards(articles: Article[]): MansetStripCard[] {
  return articles.map((article) => ({
    key: article.id,
    href: articlePath(article),
    title: article.title,
    coverUrl: article.cover_url,
    coverAlt: article.cover_alt || article.title,
  }));
}

/** Haber altı / araç sayfası: görsel etiket (H değil) + 4 kart. */
export function ArticleMansetStrip({
  label = "Günün manşetleri",
  articles,
  cards,
  logoSrc,
}: {
  label?: string;
  articles?: Article[];
  cards?: MansetStripCard[];
  logoSrc?: string | null;
}) {
  const items = (cards ?? articlesToMansetCards(articles ?? [])).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="min-w-0">
      <div className="w-fit bg-[var(--brand)] px-3.5 py-2 text-[1.05rem] font-extrabold italic uppercase tracking-wide text-white md:px-4 md:py-2.5 md:text-xl">
        {label}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="group block">
              <CoverMedia
                src={item.coverUrl}
                alt={item.coverAlt || item.title}
                sizes={IMG_SIZES.strip4}
                logoSrc={logoSrc}
                className="aspect-[16/9] w-full"
              />
              <p className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-snug text-neutral-900 group-hover:text-[var(--brand)] md:text-[16px]">
                {item.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
