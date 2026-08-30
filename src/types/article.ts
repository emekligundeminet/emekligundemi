import type { ContentType } from "@/lib/content-type";

export type ArticleStatus = "draft" | "review" | "published";
export type { ContentType };

export type Article = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_html?: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  category_id: string | null;
  author_id: string | null;
  source_id: string | null;
  type: ContentType;
  status: ArticleStatus;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  view_count: number;
  is_breaking: boolean;
  is_manset: boolean;
  evergreen: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
  category_slug?: string | null;
};
