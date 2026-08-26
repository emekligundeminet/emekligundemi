import { getArticleBySlug, listCategories } from "@/lib/store";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HaberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const haber = await getArticleBySlug(slug);
  if (!haber || haber.status !== "published") notFound();
  const categories = await listCategories();
  const kat = categories.find((c) => c.slug === haber.category);

  return (
    <div className="min-h-screen bg-[#f3ead7] text-[#1c1612]">
      <header className="border-b border-[#1c1612] bg-[#fffaf0]">
        <div className="mx-auto max-w-3xl px-5 py-4">
          <Link href="/" className="font-serif text-2xl font-bold">
            Haberbot
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#b42318]">
          {kat?.name ?? haber.category ?? "—"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold leading-tight">{haber.title}</h1>
        <p className="mt-2 text-sm text-[#6d6258]">
          {new Date(haber.updated_at).toLocaleString("tr-TR")}
        </p>
        <div
          className="haber-icerik mt-6"
          dangerouslySetInnerHTML={{ __html: haber.content }}
        />
      </article>
    </div>
  );
}
