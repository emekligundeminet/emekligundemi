import { ArticleMansetStrip, articlesToMansetCards } from "@/components/article-manset-strip";
import { calcToolsExcept } from "@/lib/calc-tools";
import { articlePath } from "@/lib/site";
import type { Article } from "@/types/article";
import type { ReactNode } from "react";

export function CalcToolPage({
  title,
  lead,
  seo,
  jsonLd,
  children,
  currentPath,
  relatedNews,
  relatedGuides,
  logoSrc,
}: {
  title: string;
  lead: string;
  seo: string;
  jsonLd: Record<string, unknown>;
  children: ReactNode;
  currentPath: string;
  relatedNews: Article[];
  relatedGuides: Article[];
  logoSrc?: string | null;
}) {
  const toolCards = calcToolsExcept(currentPath).map((t) => ({
    key: t.id,
    href: t.path,
    title: t.title,
    coverUrl: t.coverUrl,
    coverAlt: t.coverAlt ?? t.title,
  }));
  const seen = new Set(toolCards.map((c) => c.href));
  const relatedArticles = [...relatedGuides, ...relatedNews].filter((a) => {
    const href = articlePath(a);
    if (seen.has(href)) return false;
    seen.add(href);
    return true;
  });
  const relatedCards = [...toolCards, ...articlesToMansetCards(relatedArticles)].slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-[2.1rem]">
          {title}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-neutral-600">{lead}</p>
        <div className="mt-6">{children}</div>
        <section className="mt-10 pt-8">
          <h2 className="text-xl font-extrabold text-neutral-900">Nasıl hesaplanır?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-700">{seo}</p>
        </section>
      </div>
      <div className="mt-10">
        <ArticleMansetStrip
          label="Hesaplama araçları"
          cards={relatedCards}
          logoSrc={logoSrc}
        />
      </div>
    </div>
  );
}
