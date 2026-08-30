import Link from "next/link";
import { CoverMedia } from "@/components/cover-media";
import { formatNewsDate } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import type { ArticleCard } from "@/lib/site";

export function ArchiveArticleList({
  cards,
  logoSrc,
}: {
  cards: ArticleCard[];
  logoSrc?: string | null;
}) {
  if (cards.length === 0) {
    return <p className="mt-8 text-neutral-600">Bu dönemde yayınlanmış haber yok.</p>;
  }
  return (
    <ul className="mt-6 divide-y divide-neutral-200">
      {cards.map((card) => (
        <li key={card.id} className="py-4">
          <Link href={card.href} className="grid grid-cols-[7rem_1fr] gap-4 sm:grid-cols-[9rem_1fr]">
            <CoverMedia
              src={card.image}
              alt={card.alt}
              className="aspect-[16/9] w-full"
              sizes={IMG_SIZES.row}
              logoSrc={logoSrc}
            />
            <div>
              <p className="text-lg font-extrabold leading-snug hover:text-[var(--brand)]">{card.title}</p>
              {card.excerpt ? (
                <p className="mt-1 line-clamp-2 text-[15px] text-neutral-600">{card.excerpt}</p>
              ) : null}
              {card.published_at ? (
                <p className="mt-1 text-sm text-neutral-500">{formatNewsDate(card.published_at)}</p>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
