import { cn } from "@/lib/utils";
import type { Author } from "@/types/author";

/** Yazıda imza: ad + foto. Profil sayfasına link yok. */
export function AuthorByline({
  author,
  className,
}: {
  author: Pick<Author, "name" | "logo_url">;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {author.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- 32px; optimizer LCP ile yarışmasın
        <img
          src={author.logo_url}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
          decoding="async"
        />
      ) : (
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-600"
          aria-hidden
        >
          {author.name.trim().slice(0, 1).toLocaleUpperCase("tr")}
        </span>
      )}
      <span className="text-[15px] font-normal text-[#757575]">{author.name}</span>
    </div>
  );
}
