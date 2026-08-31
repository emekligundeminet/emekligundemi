import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  /** Ana manşet / haber kapağı LCP. Optimizer'ı atlar. */
  priority?: boolean;
  logoSrc?: string | null;
  className?: string;
};

/**
 * Kapak. LCP (priority) ise /_next/image yok: kaynak zaten webp, soğuk
 * optimizer TTFB'si ilk ziyarette LCP'yi 0.5–0.7s şişiriyordu.
 */
export function CoverMedia({ src, alt, sizes, priority, logoSrc, className }: Props) {
  return (
    <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
      {src && priority ? (
        // eslint-disable-next-line @next/next/no-img-element -- LCP: CDN direkt
        <img
          src={src}
          alt={alt}
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading="lazy"
          fetchPriority="auto"
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
