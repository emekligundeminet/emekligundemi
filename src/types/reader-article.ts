import type { ContentType } from "@/lib/content-type";
import type { Kaynak } from "@/lib/kaynak";

export type ReaderArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html: string;
  cover_url: string | null;
  cover_alt: string | null;
  type: ContentType;
  category_slug: string | null;
  category_name: string | null;
  author: { name: string; logo_url: string | null; bio: string | null } | null;
  source_name: string | null;
  source_logo_url: string | null;
  published_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  canonical_path: string;
  kaynaklar: Kaynak[];
};
