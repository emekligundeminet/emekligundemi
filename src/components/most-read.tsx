import Link from "next/link";
import { SectionRibbon } from "@/components/section-ribbon";
import { articlePath } from "@/lib/site";
import type { Article } from "@/types/article";

/** view_count sıralı, görselsiz numaralı liste. */
export function MostRead({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <aside>
      <SectionRibbon title="En çok okunanlar" />
      <ol className="mt-1">
        {articles.map((article, i) => (
          <li key={article.id} className="border-b border-neutral-100 py-3 last:border-b-0">
            <Link href={articlePath(article)} className="flex gap-3 hover:text-[var(--brand)]">
              <span className="w-6 shrink-0 text-xl font-extrabold text-[var(--brand)]">
                {i + 1}
              </span>
              <span className="text-[16px] font-bold leading-snug">{article.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
