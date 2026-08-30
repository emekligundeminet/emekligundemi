import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  /** Kategori sayfası; yoksa "Tümü" gizlenir, çubuk sağa uzar. */
  href?: string;
  className?: string;
};

/** Bölüm şeridi: başlık + ince eğik çubuk + daire ok. H değil. */
export function SectionRibbon({ title, href, className }: Props) {
  return (
    <div className={cn("section-ribbon", className)}>
      <p className="section-ribbon-title">{title}</p>
      <div className="section-ribbon-bar" aria-hidden />
      {href ? (
        <Link href={href} className="section-ribbon-all" aria-label={`${title} tüm haberler`}>
          <ChevronRight className="h-4 w-4 text-white" strokeWidth={2.5} aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
