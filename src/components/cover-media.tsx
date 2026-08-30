import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  /** Ana manşet LCP. */
  priority?: boolean;
  logoSrc?: string | null;
  className?: string;
};

/** Kapak: next/image veya nötr placeholder (logo). Kırmızı boş kutu yok. */
export function CoverMedia({ src, alt, sizes, priority, logoSrc, className }: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              width={56}
              height={56}
              className="h-10 w-10 object-contain opacity-40 sm:h-14 sm:w-14"
            />
          ) : (
            <span className="block h-8 w-8 rounded-sm border border-neutral-300 bg-neutral-200/80" />
          )}
        </div>
      )}
    </div>
  );
}
