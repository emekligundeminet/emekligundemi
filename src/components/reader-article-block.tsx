import Image from "next/image";
import Link from "next/link";
import { ArticleSources } from "@/components/article-sources";
import { ArticleToolbar } from "@/components/article-toolbar";
import { AuthorByline } from "@/components/author-byline";
import { GoogleFollowBar } from "@/components/google-follow-bar";
import { archivePathFromPublishedAt } from "@/lib/archive";
import { CONTACT_EMAIL } from "@/lib/publisher";
import { formatNewsDateTime, HOME_TITLE } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import { prepareArticleHtml } from "@/lib/prepare-article-html";
import type { ReaderArticle } from "@/types/reader-article";

type Props = {
  article: ReaderArticle;
  siteName?: string;
  articleUrl: string;
  followHost?: string;
  priorityCover?: boolean;
};

function sameInstant(a: string, b: string) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) < 60_000;
}

/** Tek haber gövdesi — injection yok. Sayfada tek H1. */
export function ReaderArticleBlock({
  article,
  articleUrl,
  followHost,
  priorityCover = false,
}: Props) {
  const updated =
    article.updated_at && !sameInstant(article.updated_at, article.published_at)
      ? article.updated_at
      : null;

  return (
    <article>
      <nav className="text-sm text-neutral-500" aria-label="Sayfa yolu">
        <Link href="/" className="hover:text-[var(--brand)] hover:underline">
          {HOME_TITLE}
        </Link>
        {article.category_slug && article.category_name ? (
          <>
            <span className="px-1.5" aria-hidden>
              &gt;
            </span>
            <Link
              href={`/kategori/${article.category_slug}`}
              className="hover:text-[var(--brand)] hover:underline"
            >
              {article.category_name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-4 flex flex-col gap-0.5 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
        <p className="font-medium text-[var(--brand)]">
          <span className="font-normal text-neutral-500">Yayımlanma: </span>
          <Link
            href={archivePathFromPublishedAt(article.published_at)}
            className="hover:underline"
          >
            {formatNewsDateTime(article.published_at)}
          </Link>
        </p>
        {updated ? (
          <p className="text-neutral-500">
            <span className="hidden sm:inline" aria-hidden>
              ·{" "}
            </span>
            Güncellenme: {formatNewsDateTime(updated)}
          </p>
        ) : null}
      </div>

      <h1 className="mt-2 w-full text-[1.75rem] font-extrabold leading-snug md:text-[2rem]">
        {article.title}
      </h1>

      {article.excerpt ? <p className="haber-ozet mt-5">{article.excerpt}</p> : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {article.author ? <AuthorByline author={article.author} /> : null}
        <ArticleToolbar title={article.title} url={articleUrl} />
      </div>

      {article.cover_url ? (
        <figure className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-200">
            <Image
              src={article.cover_url}
              alt={article.cover_alt || article.title}
              fill
              priority={priorityCover}
              fetchPriority={priorityCover ? "high" : "auto"}
              loading={priorityCover ? "eager" : "lazy"}
              sizes={IMG_SIZES.lcp}
              className="object-cover"
            />
          </div>
        </figure>
      ) : null}

      {followHost ? (
        <div className="mt-5 flex justify-center">
          <GoogleFollowBar sourceHost={followHost} />
        </div>
      ) : null}

      <div
        id="haber-govde"
        data-fs="md"
        className="haber-icerik mt-4"
        dangerouslySetInnerHTML={{ __html: prepareArticleHtml(article.content_html) }}
      />

      <ArticleSources kaynaklar={article.kaynaklar} />

      {article.source_name ? (
        <div className="mt-5 flex items-center gap-2">
          {article.source_logo_url ? (
            <Image
              src={article.source_logo_url}
              alt=""
              width={64}
              height={20}
              className="h-4 w-auto max-w-16 object-contain object-left"
            />
          ) : null}
          <span className="text-[13px] italic text-neutral-500">{article.source_name}</span>
        </div>
      ) : null}

      <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-[15px] font-semibold leading-snug text-neutral-800">
          Bu haberde hata gördünüz mü?
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Düzeltme: ${article.title}`)}&body=${encodeURIComponent(articleUrl)}`}
          className="mt-3 flex min-h-11 w-full shrink-0 items-center justify-center rounded-md bg-[var(--brand)] px-4 text-[15px] font-bold text-white hover:opacity-90 sm:mt-0 sm:inline-flex sm:w-auto"
        >
          Hata bildir
        </a>
      </div>
    </article>
  );
}
