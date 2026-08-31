import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  /** Kategori sayfası; yoksa "Tümü" gizlenir, çubuk sağa uzar. */
  href?: string;
  className?: string;
};

/** Bölüm şeridi: H2 + ince eğik çubuk + daire ok. */
export function SectionRibbon({ title, href, className }: Props) {
  return (
    <div className={cn("section-ribbon", className)}>
      <h2 className="section-ribbon-title">{title}</h2>
      <div className="section-ribbon-bar" aria-hidden />
      {href ? (
        <Link href={href} className="section-ribbon-all" aria-label={`${title} tüm haberler`}>
          <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
