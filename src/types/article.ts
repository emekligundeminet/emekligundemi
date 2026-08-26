export type ArticleStatus = "draft" | "published";

export type Article = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  content: string;
  status: ArticleStatus;
  created_at: string;
  updated_at: string;
};
