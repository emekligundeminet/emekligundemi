/** Künye ile aynı kabuk: H1 + prose + isteğe bağlı gri kutu + son güncelleme. */

export function LegalPageShell({
  title,
  children,
  notice,
  updatedAt,
}: {
  title: string;
  children: React.ReactNode;
  notice?: { title: string; children: React.ReactNode };
  updatedAt?: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-5 max-w-3xl space-y-4 text-[15px] leading-relaxed text-neutral-700">
        {children}
        {notice ? (
          <div className="border border-neutral-200 bg-neutral-50 px-4 py-4">
            <p className="font-semibold text-neutral-900">{notice.title}</p>
            <div className="mt-2">{notice.children}</div>
          </div>
        ) : null}
        {updatedAt ? (
          <p className="pt-2 text-sm text-neutral-500">Son güncelleme: {updatedAt}</p>
        ) : null}
      </div>
    </div>
  );
}
