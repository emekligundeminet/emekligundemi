import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "@/lib/cache-tags";

/** Yayın/güncelleme/silme sonrası yalnız BU tenant'ın cache'i. */
export function revalidateTenantContent(opts: {
  tenantId: string;
  slugs?: string[];
  categorySlugs?: (string | null | undefined)[];
}) {
  const { tenantId } = opts;
  const tags = cacheTags(tenantId);
  revalidateTag(tags.articles, "max");
  revalidateTag(tags.home, "max");
  revalidateTag(tags.categories, "max");
  revalidateTag(tags.blog, "max");
  for (const slug of new Set((opts.slugs ?? []).filter(Boolean))) {
    revalidateTag(tags.article(slug), "max");
  }
  for (const cat of new Set(
    (opts.categorySlugs ?? []).filter((s): s is string => Boolean(s && s.trim()))
  )) {
    revalidateTag(tags.category(cat), "max");
  }
  // Tam sayfa ISR kabuğu
  revalidatePath(`/t/${tenantId}`, "layout");
}
