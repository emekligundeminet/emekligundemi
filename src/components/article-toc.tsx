import type { TocItem } from "@/lib/article-toc";

/** Rehber gövdesinin üstünde sade içindekiler. İki başlıktan azsa gizlenir. */
export function ArticleToc({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;

  return (
    <nav className="article-toc" aria-label="İçindekiler">
      <p className="article-toc-label">İçindekiler</p>
      <ol>
        {items.map((item) => (
          <li key={item.id} data-level={item.level}>
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
