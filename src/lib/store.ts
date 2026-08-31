/**
 * Admin CRUD. Taslak SELECT RLS'de yok; bu yüzden service_role + tenant_id
 * filtresi (üyelik requireAdminApi ile doğrulanır).
 */
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { Article, ArticleStatus } from "@/types/article";
import type { Category } from "@/types/category";
import type { Author } from "@/types/author";
import type { Source } from "@/types/source";
import { articlePath, parseContentType, uniquifySlug } from "@/lib/content-type";
import { authorSlug } from "@/lib/author-slug";
import { CATEGORY_NAV_ORDER } from "@/lib/site";
import type { ContentType } from "@/lib/content-type";

const ARTICLE_LIST_COLS =
  "id,tenant_id,slug,title,excerpt,cover_url,cover_alt,category_id,author_id,source_id,type,status,published_at,meta_title,meta_description,canonical_url,view_count,is_breaking,is_manset,evergreen,created_at,updated_at";

const ARTICLE_FULL_COLS = `${ARTICLE_LIST_COLS},content_html`;

const CATEGORY_COLS = "id,tenant_id,name,slug,sort_order,meta_title,meta_description";
const CATEGORY_COLS_BASIC = "id,tenant_id,name,slug,sort_order";
const AUTHOR_COLS = "id,tenant_id,name,logo_url,bio";
const SOURCE_COLS = "id,tenant_id,name,logo_url";

function fail(error: { message?: string; details?: string; hint?: string; code?: string } | null): never {
  const parts = [error?.message, error?.details, error?.hint, error?.code].filter(Boolean);
  throw new Error(parts.join(" — ") || "Supabase hatası.");
}

type JoinedCategory = { name: string; slug: string };

type ArticleRow = Record<string, unknown> & {
  categories?: JoinedCategory | JoinedCategory[] | null;
};

function mapArticle(row: ArticleRow): Article {
  const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return {
    id: row.id as string,
    tenant_id: row.tenant_id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: (row.excerpt as string | null) ?? null,
    content_html: (row.content_html as string | null) ?? null,
    cover_url: (row.cover_url as string | null) ?? null,
    cover_alt: (row.cover_alt as string | null) ?? null,
    category_id: (row.category_id as string | null) ?? null,
    author_id: (row.author_id as string | null) ?? null,
    source_id: (row.source_id as string | null) ?? null,
    type: parseContentType(row.type),
    status: row.status as Article["status"],
    published_at: (row.published_at as string | null) ?? null,
    meta_title: (row.meta_title as string | null) ?? null,
    meta_description: (row.meta_description as string | null) ?? null,
    canonical_url: (row.canonical_url as string | null) ?? null,
    view_count: (row.view_count as number) ?? 0,
    is_breaking: Boolean(row.is_breaking),
    is_manset: Boolean(row.is_manset),
    evergreen: Boolean(row.evergreen),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    category_name: cat?.name ?? null,
    category_slug: cat?.slug ?? null,
  };
}

function sortCategories(rows: Category[]) {
  return [...rows].sort((a, b) => {
    const ai = CATEGORY_NAV_ORDER.indexOf(a.slug);
    const bi = CATEGORY_NAV_ORDER.indexOf(b.slug);
    const av = ai === -1 ? 999 : ai;
    const bv = bi === -1 ? 999 : bi;
    if (av !== bv) return av - bv;
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
    return a.name.localeCompare(b.name, "tr");
  });
}

/** meta kolonları henüz yoksa (migration öncesi) liste yine gelsin. */
async function selectTenantCategories(tenantId: string, cols: string) {
  const supabase = createSupabaseAdminClient();
  return supabase
    .from("categories")
    .select(cols)
    .eq("tenant_id", tenantId)
    .order("sort_order")
    .order("name");
}

export async function getCategories(tenantId: string) {
  let { data, error } = await selectTenantCategories(tenantId, CATEGORY_COLS);
  if (error && /meta_title|meta_description/.test(error.message)) {
    ({ data, error } = await selectTenantCategories(tenantId, CATEGORY_COLS_BASIC));
  }
  if (error) fail(error);
  return sortCategories((data ?? []) as unknown as Category[]);
}

export const listCategories = getCategories;

export async function getCategory(tenantId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  let { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error && /meta_title|meta_description/.test(error.message)) {
    ({ data, error } = await supabase
      .from("categories")
      .select(CATEGORY_COLS_BASIC)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle());
  }
  if (error) fail(error);
  return (data as Category | null) ?? null;
}

export async function createCategory(
  tenantId: string,
  input: { name: string; slug: string; sort_order?: number }
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      tenant_id: tenantId,
      name: input.name,
      slug: input.slug,
      sort_order: input.sort_order ?? 0,
    })
    .select(CATEGORY_COLS)
    .single();
  if (error) fail(error);
  return data as Category;
}

export async function updateCategory(tenantId: string, input: Category) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug,
      sort_order: input.sort_order ?? 0,
      ...(input.meta_title !== undefined ? { meta_title: input.meta_title } : {}),
      ...(input.meta_description !== undefined
        ? { meta_description: input.meta_description }
        : {}),
    })
    .eq("id", input.id)
    .eq("tenant_id", tenantId)
    .select(CATEGORY_COLS)
    .single();
  if (error) fail(error);
  return data as Category;
}

export async function deleteCategory(tenantId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);
  if (error) fail(error);
}

export async function getAuthors(tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("authors")
    .select(AUTHOR_COLS)
    .eq("tenant_id", tenantId)
    .order("name");
  if (error) fail(error);
  return (data ?? []) as Author[];
}

export const listAuthors = getAuthors;

export async function getAuthorBySlug(tenantId: string, slug: string) {
  const authors = await getAuthors(tenantId);
  return authors.find((a) => authorSlug(a.name) === slug) ?? null;
}

export async function getAuthor(tenantId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("authors")
    .select(AUTHOR_COLS)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) fail(error);
  return (data as Author | null) ?? null;
}

export async function createAuthor(
  tenantId: string,
  input: { name: string; logo_url?: string | null; bio?: string | null }
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("authors")
    .insert({
      tenant_id: tenantId,
      name: input.name,
      logo_url: input.logo_url ?? null,
      bio: input.bio ?? null,
    })
    .select(AUTHOR_COLS)
    .single();
  if (error) fail(error);
  return data as Author;
}

export async function updateAuthor(tenantId: string, input: Author) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("authors")
    .update({
      name: input.name,
      logo_url: input.logo_url ?? null,
      bio: input.bio ?? null,
    })
    .eq("id", input.id)
    .eq("tenant_id", tenantId)
    .select(AUTHOR_COLS)
    .single();
  if (error) fail(error);
  return data as Author;
}

export async function deleteAuthor(tenantId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("authors")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);
  if (error) fail(error);
}

export async function getSources(tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sources")
    .select(SOURCE_COLS)
    .eq("tenant_id", tenantId)
    .order("name");
  if (error) fail(error);
  return (data ?? []) as Source[];
}

export const listSources = getSources;

export async function createSource(
  tenantId: string,
  input: { name: string; logo_url?: string | null }
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sources")
    .insert({
      tenant_id: tenantId,
      name: input.name,
      logo_url: input.logo_url ?? null,
    })
    .select(SOURCE_COLS)
    .single();
  if (error) fail(error);
  return data as Source;
}

export async function updateSource(tenantId: string, input: Source) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sources")
    .update({
      name: input.name,
      logo_url: input.logo_url ?? null,
    })
    .eq("id", input.id)
    .eq("tenant_id", tenantId)
    .select(SOURCE_COLS)
    .single();
  if (error) fail(error);
  return data as Source;
}

export async function deleteSource(tenantId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("sources")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);
  if (error) fail(error);
}

export async function listArticles(tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const joined = `${ARTICLE_LIST_COLS}, categories ( name, slug )`;
  let { data, error } = await supabase
    .from("articles")
    .select(joined)
    .eq("tenant_id", tenantId)
    .order("updated_at", { ascending: false });
  if (error && /evergreen/.test(error.message)) {
    ({ data, error } = await supabase
      .from("articles")
      .select(joined.replace(",evergreen", ""))
      .eq("tenant_id", tenantId)
      .order("updated_at", { ascending: false }));
  }
  if (error) fail(error);
  return ((data ?? []) as unknown as ArticleRow[]).map(mapArticle);
}

export async function getArticle(tenantId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select(`${ARTICLE_FULL_COLS}, categories ( name, slug )`)
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (error) fail(error);
  if (!data) return null;
  return mapArticle(data as unknown as ArticleRow);
}

export async function ensureUniqueSlug(
  tenantId: string,
  desired: string,
  excludeId?: string
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id,slug")
    .eq("tenant_id", tenantId);
  if (error) fail(error);

  const taken = ((data ?? []) as { id: string; slug: string }[])
    .filter((row) => row.id !== excludeId)
    .map((row) => row.slug);

  return uniquifySlug(desired, taken);
}

type ArticleWrite = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content_html?: string | null;
  cover_url?: string | null;
  cover_alt?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  source_id?: string | null;
  status?: ArticleStatus;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  is_breaking?: boolean;
  is_manset?: boolean;
  evergreen?: boolean;
  type?: ContentType;
};

function publishStamp(status: ArticleStatus, existingPublishedAt?: string | null) {
  if (status !== "published") {
    return { status, published_at: existingPublishedAt ?? null };
  }
  return {
    status,
    published_at: existingPublishedAt || new Date().toISOString(),
  };
}

/** Yayınlanmış manşet 4'ü aşarsa en eski tarihli tik kalkar. */
async function trimMansetSlots(tenantId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("articles")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .eq("type", "news")
    .eq("is_manset", true)
    .order("published_at", { ascending: false })
    .order("id", { ascending: false });
  if (error) fail(error);
  const extra = (data ?? []).slice(4).map((row) => row.id as string);
  if (extra.length === 0) return;
  const { error: upErr } = await supabase
    .from("articles")
    .update({ is_manset: false })
    .eq("tenant_id", tenantId)
    .in("id", extra);
  if (upErr) fail(upErr);
}

export async function createArticle(tenantId: string, input: ArticleWrite) {
  const supabase = createSupabaseAdminClient();
  const status = input.status ?? "draft";
  const stamp = publishStamp(status, input.published_at);
  for (let attempt = 0; attempt < 6; attempt++) {
    const slug = await ensureUniqueSlug(tenantId, input.slug);
    const { data, error } = await supabase
      .from("articles")
      .insert({
        tenant_id: tenantId,
        title: input.title,
        slug,
        excerpt: input.excerpt ?? null,
        content_html: input.content_html ?? "",
        cover_url: input.cover_url ?? null,
        cover_alt: input.cover_alt ?? null,
        category_id: input.category_id ?? null,
        author_id: input.author_id ?? null,
        source_id: input.source_id ?? null,
        type: parseContentType(input.type),
        status: stamp.status,
        published_at: stamp.published_at,
        meta_title: input.meta_title ?? null,
        meta_description: input.meta_description ?? null,
        canonical_url: input.canonical_url ?? null,
        is_breaking: Boolean(input.is_breaking),
        is_manset: Boolean(input.is_manset),
        evergreen: Boolean(input.evergreen),
      })
      .select(ARTICLE_FULL_COLS)
      .single();
    if (!error) {
      if (stamp.status === "published") await trimMansetSlots(tenantId);
      return mapArticle(data as unknown as ArticleRow);
    }
    if (error.code !== "23505") {
      if (/evergreen/i.test(error.message ?? "")) {
        const again = await supabase
          .from("articles")
          .insert({
            tenant_id: tenantId,
            title: input.title,
            slug,
            excerpt: input.excerpt ?? null,
            content_html: input.content_html ?? "",
            cover_url: input.cover_url ?? null,
            cover_alt: input.cover_alt ?? null,
            category_id: input.category_id ?? null,
            author_id: input.author_id ?? null,
            source_id: input.source_id ?? null,
            type: parseContentType(input.type),
            status: stamp.status,
            published_at: stamp.published_at,
            meta_title: input.meta_title ?? null,
            meta_description: input.meta_description ?? null,
            canonical_url: input.canonical_url ?? null,
            is_breaking: Boolean(input.is_breaking),
            is_manset: Boolean(input.is_manset),
          })
          .select(ARTICLE_FULL_COLS.replace(",evergreen", ""))
          .single();
        if (!again.error && again.data) {
          if (stamp.status === "published") await trimMansetSlots(tenantId);
          return mapArticle(again.data as unknown as ArticleRow);
        }
        if (again.error && again.error.code !== "23505") fail(again.error);
      } else {
        fail(error);
      }
    }
  }
  fail({ message: "Bu URL kullanımda, tekrar deneyin." });
}

export async function updateArticle(
  tenantId: string,
  id: string,
  patch: Partial<ArticleWrite>
) {
  const supabase = createSupabaseAdminClient();
  const current = await getArticle(tenantId, id);
  if (!current) fail({ message: "Haber bulunamadı." });

  const slug =
    patch.slug !== undefined
      ? await ensureUniqueSlug(tenantId, patch.slug, id)
      : undefined;
  const nextStatus = patch.status ?? current.status;
  const stamp =
    patch.status !== undefined
      ? publishStamp(nextStatus, current.published_at)
      : {};
  const { data, error } = await supabase
    .from("articles")
    .update({
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
      ...(patch.content_html !== undefined ? { content_html: patch.content_html } : {}),
      ...(patch.cover_url !== undefined ? { cover_url: patch.cover_url } : {}),
      ...(patch.cover_alt !== undefined ? { cover_alt: patch.cover_alt } : {}),
      ...(patch.category_id !== undefined ? { category_id: patch.category_id } : {}),
      ...(patch.author_id !== undefined ? { author_id: patch.author_id } : {}),
      ...(patch.source_id !== undefined ? { source_id: patch.source_id } : {}),
      ...stamp,
      ...(patch.meta_title !== undefined ? { meta_title: patch.meta_title } : {}),
      ...(patch.meta_description !== undefined
        ? { meta_description: patch.meta_description }
        : {}),
      ...(patch.canonical_url !== undefined ? { canonical_url: patch.canonical_url } : {}),
      ...(patch.is_breaking !== undefined ? { is_breaking: Boolean(patch.is_breaking) } : {}),
      ...(patch.is_manset !== undefined ? { is_manset: Boolean(patch.is_manset) } : {}),
      ...(patch.evergreen !== undefined ? { evergreen: Boolean(patch.evergreen) } : {}),
      ...(patch.type !== undefined ? { type: parseContentType(patch.type) } : {}),
    })
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .select(ARTICLE_FULL_COLS)
    .single();
  if (error) fail(error);
  await trimMansetSlots(tenantId);
  return data as Article;
}

export async function publishArticle(tenantId: string, id: string) {
  return updateArticle(tenantId, id, { status: "published" });
}

export type EvergreenTarget = {
  id: string;
  title: string;
  path: string;
  category_id: string | null;
  category_name: string | null;
};

/** Yayınlanmış evergreen hedefler. URL articlePath ile üretilir. */
export async function listEvergreenTargets(
  tenantId: string,
  excludeId?: string
): Promise<EvergreenTarget[]> {
  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("articles")
    .select("id,title,slug,type,category_id,categories(name,slug)")
    .eq("tenant_id", tenantId)
    .eq("evergreen", true)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) fail(error);
  return ((data ?? []) as ArticleRow[])
    .map((row) => {
      const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      const slug = row.slug as string;
      const path = articlePath({ slug, type: parseContentType(row.type) });
      return {
        id: row.id as string,
        title: row.title as string,
        path,
        category_id: (row.category_id as string | null) ?? null,
        category_name: cat?.name ?? null,
      };
    })
    .filter((row) => row.path.startsWith("/"));
}

export async function deleteArticle(tenantId: string, id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id)
    .eq("tenant_id", tenantId);
  if (error) fail(error);
}

/** RLS yalnızca owner'a tenants UPDATE verir; editor için service_role (üyelik app'te doğrulanır). */
export async function updateTenantSettings(
  tenantId: string,
  settings: Record<string, unknown>
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("tenants")
    .update({ settings })
    .eq("id", tenantId)
    .select("id, settings")
    .single();
  if (error) fail(error);
  return data;
}
