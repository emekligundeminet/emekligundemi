import { ExternalLink } from "lucide-react";
import { hostLabel, kaynakRel, type Kaynak } from "@/lib/kaynak";

/** Yazının sonunda kaynak listesi. Boşsa hiç render edilmez. */
export function ArticleSources({ kaynaklar }: { kaynaklar: Kaynak[] }) {
  if (kaynaklar.length === 0) return null;

  return (
    <section className="mt-8 border-t border-neutral-200 pt-4" aria-labelledby="kaynaklar">
      <h2
        id="kaynaklar"
        className="text-[13px] font-bold uppercase tracking-wide text-neutral-500"
      >
        Kaynaklar
      </h2>
      <ul className="mt-2 divide-y divide-neutral-100">
        {kaynaklar.map((kaynak) => (
          <li key={kaynak.url}>
            <a
              href={kaynak.url}
              target="_blank"
              rel={kaynakRel(kaynak.dofollow)}
              className="group flex items-baseline justify-between gap-3 py-2.5 text-[15px] hover:text-[var(--brand)]"
            >
              <span className="min-w-0">
                <span className="font-medium text-neutral-800 group-hover:text-[var(--brand)]">
                  {kaynak.etiket}
                </span>
                <span className="ml-2 break-all text-[13px] text-neutral-400">
                  {hostLabel(kaynak.url)}
                </span>
              </span>
              <ExternalLink
                className="mt-0.5 size-3.5 shrink-0 text-neutral-400 group-hover:text-[var(--brand)]"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
