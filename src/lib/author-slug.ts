import { slugify } from "@/lib/slugify";

export function authorSlug(name: string): string {
  return slugify(name);
}

export function authorPath(name: string): string {
  return `/yazar/${authorSlug(name)}`;
}
