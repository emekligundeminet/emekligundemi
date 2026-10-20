import Link from "next/link";
import { Calculator, ChevronRight } from "lucide-react";
import { CALC_TOOLS } from "@/lib/calc-tools";

/** Kategoriye göre haberin altında önerilecek hesaplama araçları (id sırası önemli). */
const KATEGORI_ARACLARI: Record<string, string[]> = {
  zam: ["emekli-zam", "emekli-maasi"],
  "emekli-maasi": ["emekli-maasi", "emekli-zam"],
  "ikramiye-ve-odemeler": ["bayram-ikramiye", "emekli-maasi"],
  promosyon: ["emekli-maasi", "emekli-zam"],
  sgk: ["emekli-maasi", "emekli-zam"],
};
const VARSAYILAN = ["emekli-maasi", "emekli-zam"];

const ACIKLAMA: Record<string, string> = {
  "emekli-maasi": "Prim gününüze göre tahmini maaşınız",
  "emekli-zam": "Zam sonrası yeni maaşınız ne olacak?",
  "bayram-ikramiye": "Ne zaman, ne kadar yatacak?",
  "alim-gucu": "Maaşınız enflasyona karşı ne kaybetti?",
};

/** Haber altı iç link: okuru ilgili araca taşır (araçlar sitenin kalıcı trafik sayfaları). */
export function ArticleToolBox({ categorySlug }: { categorySlug: string | null }) {
  const ids = (categorySlug && KATEGORI_ARACLARI[categorySlug]) || VARSAYILAN;
  const araclar = ids
    .map((id) => CALC_TOOLS.find((t) => t.id === id))
    .filter((t): t is (typeof CALC_TOOLS)[number] => Boolean(t));
  if (araclar.length === 0) return null;

  return (
    <aside className="mt-8 rounded-lg border border-neutral-200 p-4" aria-label="Hesaplama araçları">
      <p className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-neutral-500">
        <Calculator className="size-4 text-[var(--brand)]" />
        Hesaplayın
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {araclar.map((t) => (
          <li key={t.id}>
            <Link
              href={t.path}
              className="flex min-h-14 items-center justify-between gap-3 rounded-md bg-neutral-50 px-3 py-2.5 hover:bg-neutral-100"
            >
              <span>
                <span className="block text-[15px] font-bold text-neutral-900">{t.title}</span>
                <span className="block text-[13px] text-neutral-500">{ACIKLAMA[t.id]}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-[var(--brand)]" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
