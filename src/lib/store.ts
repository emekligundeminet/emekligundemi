import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

function fail(error: { message: string } | null): never {
  throw new Error(error?.message ?? "Supabase hatası.");
}

export async function listCategories() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,meta_title,meta_description")
    .order("name");
  if (error) fail(error);
  return (data ?? []) as Category[];
}

export async function createCategory(input: {
  name: string;
  slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      slug: input.slug,
      meta_title: input.meta_title ?? null,
      meta_description: input.meta_description ?? null,
    })
    .select("id,name,slug,meta_title,meta_description")
    .single();
  if (error) fail(error);
  return data as Category;
}

export async function updateCategory(input: Category) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug,
      meta_title: input.meta_title ?? null,
      meta_description: input.meta_description ?? null,
    })
    .eq("id", input.id)
    .select("id,name,slug,meta_title,meta_description")
    .single();
  if (error) fail(error);
  return data as Category;
}

export async function deleteCategory(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) fail(error);
}

export async function listArticles() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,category,content,status,created_at,updated_at")
    .order("updated_at", { ascending: false });
  if (error) fail(error);
  return (data ?? []) as Article[];
}

export async function getArticle(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,category,content,status,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) fail(error);
  return (data as Article | null) ?? null;
}

export async function getArticleBySlug(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,category,content,status,created_at,updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error) fail(error);
  return (data as Article | null) ?? null;
}

export async function createArticle(
  input: Omit<Article, "id" | "created_at" | "updated_at">
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .insert({
      title: input.title,
      slug: input.slug,
      category: input.category ?? null,
      content: input.content ?? "",
      status: input.status,
    })
    .select("id,title,slug,category,content,status,created_at,updated_at")
    .single();
  if (error) fail(error);
  return data as Article;
}

export async function updateArticle(
  id: string,
  patch: Partial<Omit<Article, "id" | "created_at">>
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .update({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.content !== undefined ? { content: patch.content } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    })
    .eq("id", id)
    .select("id,title,slug,category,content,status,created_at,updated_at")
    .single();
  if (error) fail(error);
  return data as Article;
}

export async function deleteArticle(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) fail(error);
}
