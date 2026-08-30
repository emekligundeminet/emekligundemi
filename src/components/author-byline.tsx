import Image from "next/image";
import Link from "next/link";
import { authorPath } from "@/lib/author-slug";
import { cn } from "@/lib/utils";
import type { Author } from "@/types/author";

export function AuthorByline({
  author,
  className,
}: {
  author: Pick<Author, "name" | "logo_url">;
  className?: string;
}) {
  const href = authorPath(author.name);
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 hover:opacity-90", className)}>
      {author.logo_url ? (
        <Image
          src={author.logo_url}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
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
    </Link>
  );
}
