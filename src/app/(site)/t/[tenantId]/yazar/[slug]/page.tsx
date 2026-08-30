import Link from "next/link";
import Image from "next/image";
import { CoverMedia } from "@/components/cover-media";
import { FeedPagination } from "@/components/feed-pagination";
import { authorPath } from "@/lib/author-slug";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/json-ld";
import { cachedSiteMeta } from "@/lib/cached-public";
import { getPublishedArticles } from "@/lib/data/articles";
import { getAuthorBySlug } from "@/lib/store";
import { formatNewsDate, toArticleCard } from "@/lib/site";
import { IMG_SIZES } from "@/lib/image-sizes";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = {
  params: Promise<{ tenantId: string; slug: string }>;
  searchParams: Promise<{ sayfa?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantId, slug } = await params;
  const [site, author] = await Promise.all([
    cachedSiteMeta(tenantId),
    getAuthorBySlug(tenantId, slug),
  ]);
  if (!author) return {};
  const path = authorPath(author.name);
  return {
    title: author.name,
    description: author.bio?.trim() || `${author.name} — ${site?.name ?? "Emekliler"} yazarı.`,
    alternates: { canonical: site ? `${site.origin}${path}` : path },
    openGraph: {
      type: "profile",
      title: author.name,
      description: author.bio?.trim() || undefined,
      url: site ? `${site.origin}${path}` : path,
    },
  };
}

export default async function YazarPage({ params, searchParams }: Props) {
  const { tenantId, slug } = await params;
  const { sayfa } = await searchParams;
  const page = Math.max(1, Number(sayfa) || 1);
  const [site, author] = await Promise.all([
    cachedSiteMeta(tenantId),
    getAuthorBySlug(tenantId, slug),
  ]);
  if (!site || !author) notFound();

  const feed = await getPublishedArticles(tenantId, {
    authorId: author.id,
    limit: 24,
    offset: (page - 1) * 24,
  });
  const cards = feed.articles.map(toArticleCard);
  const path = authorPath(author.name);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([
            breadcrumbJsonLd(site.origin, [
              { name: "Emekli Haberleri", path: "/" },
              { name: author.name, path },
            ]),
            {
              "@context": "https://schema.org",
              "@type": "Person",
              name: author.name,
              url: `${site.origin}${path}`,
              image: author.logo_url || undefined,
              description: author.bio || undefined,
              worksFor: { "@type": "NewsMediaOrganization", name: site.name },
            },
          ]),
        }}
      />
      <header className="flex items-start gap-4 border-b-2 border-[var(--brand)] pb-5">
        {author.logo_url ? (
          <Image
            src={author.logo_url}
            alt=""
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-full object-cover"
          />
        ) : (
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-neutral-200 text-xl font-bold">
            {author.name.trim().slice(0, 1).toLocaleUpperCase("tr")}
          </span>
        )}
        <div>
          <h1 className="text-3xl font-extrabold">{author.name}</h1>
          {author.bio ? (
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
              {author.bio}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-neutral-500">{feed.total} yazı</p>
        </div>
      </header>

      {cards.length === 0 ? (
        <p className="mt-8 text-neutral-600">Bu yazarın yayınlanmış yazısı yok.</p>
      ) : (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id}>
              <Link href={card.href} className="block">
                <CoverMedia
                  src={card.image}
                  alt={card.alt}
                  className="aspect-[16/9] w-full"
                  sizes={IMG_SIZES.grid3}
                  logoSrc={site.logoUrl}
                />
                <p className="mt-3 text-[16px] font-extrabold leading-snug hover:text-[var(--brand)]">
                  {card.title}
                </p>
                {card.published_at ? (
                  <p className="mt-1 text-sm text-neutral-500">{formatNewsDate(card.published_at)}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <FeedPagination basePath={path} page={page} total={feed.total} pageSize={24} />
    </div>
  );
}
