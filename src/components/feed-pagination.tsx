import Link from "next/link";

export function FeedPagination({
  basePath,
  page,
  total,
  pageSize,
}: {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const href = (n: number) => (n <= 1 ? basePath : `${basePath}?sayfa=${n}`);
  const prev = page > 1 ? page - 1 : null;
  const next = page < pages ? page + 1 : null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Sayfalar">
      {prev ? (
        <Link
          href={href(prev)}
          rel="prev"
          className="inline-flex min-h-11 items-center rounded-md border border-neutral-900 px-4 text-sm font-bold uppercase"
        >
          Önceki
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center px-4 text-sm text-neutral-400">Önceki</span>
      )}
      <p className="text-sm text-neutral-600">
        {page} / {pages}
      </p>
      {next ? (
        <Link
          href={href(next)}
          rel="next"
          className="inline-flex min-h-11 items-center rounded-md border border-neutral-900 px-4 text-sm font-bold uppercase"
        >
          Sonraki
        </Link>
      ) : (
        <span className="inline-flex min-h-11 items-center px-4 text-sm text-neutral-400">Sonraki</span>
      )}
    </nav>
  );
}
