import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { CoverMedia } from "@/components/cover-media";
import { articlePath } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import { cn } from "@/lib/utils";
import type { Article } from "@/types/article";

/** Sağ sütun: görsel etiket (H değil) + en güncel 5. */
export function NewsRelatedSidebar({
  articles,
  href,
  title = "İlgili haberler",
  logoSrc,
  className,
}: {
  articles: Article[];
  href?: string;
  title?: string;
  logoSrc?: string | null;
  className?: string;
}) {
  return (
    <aside className={cn("hidden lg:sticky lg:top-[7.25rem] lg:block lg:self-start", className)}>
      <AdSlot placement="sidebar" />
      <p className="text-xl font-extrabold tracking-tight text-neutral-900">
        {href ? (
          <Link href={href} className="hover:text-[var(--brand)]">
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
      {articles.length === 0 ? (
        <p className="py-4 text-sm text-neutral-500">Başka yayınlanmış haber yok.</p>
      ) : (
        <ul className="mt-4">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-neutral-200 py-3 last:border-b-0 first:pt-0">
              <Link href={articlePath(article)} className="group grid grid-cols-[8rem_1fr] items-start gap-3.5">
                <CoverMedia
                  src={article.cover_url}
                  alt={article.cover_alt || article.title}
                  sizes={IMG_SIZES.row}
                  logoSrc={logoSrc}
                  className="aspect-[16/9] w-full"
                />
                <p className="text-[15px] font-extrabold leading-snug text-neutral-900 group-hover:text-[var(--brand)]">
                  {article.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
