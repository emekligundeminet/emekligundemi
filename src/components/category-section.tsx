import Link from "next/link";
import { CoverMedia } from "@/components/cover-media";
import { SectionRibbon } from "@/components/section-ribbon";
import { articlePath, excerptFromHtml } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

type Props = {
  category: Category;
  articles: Article[];
  logoSrc?: string | null;
  href?: string;
  /** Şerit başlığı; yoksa kategori adı. */
  title?: string;
};

/** 1 büyük (özetli) + sağda 2×2 grid. Haber yoksa gizli; azsa boş hücre yok. */
export function CategorySection({ category, articles, logoSrc, href, title }: Props) {
  if (articles.length < 1) return null;

  const [lead, ...rest] = articles;
  const grid = rest.slice(0, 4);
  if (!lead) return null;

  const summary = excerptFromHtml(lead.excerpt || lead.content_html || "", 170);
  const listHref = href ?? `/kategori/${category.slug}`;

  return (
    <section className="mt-10 md:mt-12">
      <SectionRibbon
        className="mb-5"
        title={title ?? category.name}
        href={listHref}
      />

      <div
        className={`grid gap-5 lg:items-start ${
          grid.length > 0 ? "lg:grid-cols-2 lg:gap-6" : ""
        }`}
      >
        <article>
          <Link href={articlePath(lead)} className="block">
            <CoverMedia
              src={lead.cover_url}
              alt={lead.cover_alt || lead.title}
              sizes={IMG_SIZES.sectionLead}
              logoSrc={logoSrc}
              className="aspect-[16/9] w-full"
            />
          </Link>
          <h3 className="mt-3 text-xl font-extrabold leading-snug md:text-2xl">
            <Link href={articlePath(lead)} className="hover:text-[var(--brand)]">
              {lead.title}
            </Link>
          </h3>
          {summary ? (
            <p className="mt-2 line-clamp-3 text-[16px] leading-relaxed text-neutral-600">
              {summary}
            </p>
          ) : null}
        </article>

        {grid.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4">
            {grid.map((article) => (
              <li key={article.id}>
                <Link href={articlePath(article)} className="group block">
                  <CoverMedia
                    src={article.cover_url}
                    alt={article.cover_alt || article.title}
                    sizes={IMG_SIZES.sectionGrid}
                    logoSrc={logoSrc}
                    className="aspect-[16/9] w-full"
                  />
                  <p className="mt-2 line-clamp-2 text-[15px] font-extrabold leading-snug text-neutral-900 group-hover:text-[var(--brand)] md:text-[16px]">
                    {article.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
