import { listArticles, listCategories } from "@/lib/store";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [articles, categories] = await Promise.all([
    listArticles(),
    listCategories(),
  ]);
  const yayinda = articles.filter((a) => a.status === "published");

  return (
    <div className="min-h-screen bg-[#f3ead7] text-[#1c1612]">
      <header className="border-b-8 border-[#1c1612] bg-[#fffaf0]">
        <div className="mx-auto flex max-w-3xl items-baseline justify-between px-5 py-5">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight">
            Haberbot
          </Link>
          <Link href="/admin" className="text-sm text-[#6d6258] hover:underline">
            Admin
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        {yayinda.length === 0 ? (
          <p className="text-[#6d6258]">
            Henüz yayınlanmış haber yok. Admin panelden ekleyin.
          </p>
        ) : (
          <ul className="space-y-4">
            {yayinda.map((a) => {
              const kat = categories.find((c) => c.slug === a.category);
              return (
                <li key={a.id} className="border-l-4 border-[#b42318] bg-[#fffaf0] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#b42318]">
                    {kat?.name ?? a.category ?? "—"}
                  </p>
                  <Link href={`/haber/${a.slug}`} className="font-serif text-xl font-bold hover:underline">
                    {a.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
