import { articlePath, parseContentType, type ContentType } from "@/lib/content-type";
import { parseKaynaklar } from "@/lib/kaynak";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import type { ReaderArticle } from "@/types/reader-article";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";

const LIST_COLS =
  "id,tenant_id,slug,title,excerpt,cover_url,cover_alt,category_id,author_id,source_id,type,status,published_at,meta_title,meta_description,canonical_url,view_count,is_breaking,is_manset,kaynaklar,created_at,updated_at";

const READER_SELECT = `
  ${LIST_COLS},
  content_html,
  categories ( name, slug ),
  authors ( id, name, logo_url, bio ),
  sources ( name, logo_url )
`;

const CARD_SELECT = `
  ${LIST_COLS},
  categories ( name, slug )
`;

function fail(error: { message: string } | null): never {
  throw new Error(error?.message ?? "Supabase hatası.");
}

type Rel = { name: string; slug?: string; logo_url?: string | null; bio?: string | null };

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function published(tenantId: string, select: string, count?: "exact") {
  return createSupabaseAdminClient()
    .from("articles")
    .select(select, count ? { count } : undefined)
    .eq("tenant_id", tenantId)
    .eq("status", "published")
    .not("published_at", "is", null);
}

function mapList(row: Record<string, unknown>): Article {
  const cat = one(row.categories as Rel | Rel[] | null);
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
    kaynaklar: parseKaynaklar(row.kaynaklar),
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    category_name: cat?.name ?? null,
    category_slug: cat?.slug ?? null,
  };
}

function toReader(row: Record<string, unknown>): ReaderArticle {
  const cat = one(row.categories as Rel | Rel[] | null);
  const author = one(row.authors as Rel | Rel[] | null);
  const source = one(row.sources as Rel | Rel[] | null);
  const published_at = (row.published_at as string) || (row.updated_at as string);
  const updated_at = (row.updated_at as string) || published_at;
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    excerpt: (row.excerpt as string | null) ?? null,
    content_html: (row.content_html as string) ?? "",
    cover_url: (row.cover_url as string | null) ?? null,
    cover_alt: (row.cover_alt as string | null) ?? null,
    type: parseContentType(row.type),
    category_slug: cat?.slug ?? null,
    category_name: cat?.name ?? null,
    author: author
      ? { name: author.name, logo_url: author.logo_url ?? null, bio: author.bio ?? null }
      : null,
    source_name: source?.name ?? null,
    source_logo_url: source?.logo_url ?? null,
    published_at,
    updated_at,
    meta_title: (row.meta_title as string | null) ?? null,
    meta_description: (row.meta_description as string | null) ?? null,
    canonical_path: articlePath({ slug: row.slug as string, type: parseContentType(row.type) }),
    kaynaklar: parseKaynaklar(row.kaynaklar),
  };
}

export type FeedCursor = { published_at: string; id: string };

export function encodeCursor(c: FeedCursor) {
  return `${c.published_at}__${c.id}`;
}

export function decodeCursor(raw: string | null): FeedCursor | null {
  if (!raw) return null;
  const i = raw.lastIndexOf("__");
  if (i <= 0) return null;
  return { published_at: raw.slice(0, i), id: raw.slice(i + 2) };
}

/** Yayınlanmış haberler. content_html çekilmez. */
export async function getPublishedArticles(
  tenantId: string,
  opts: {
    categoryId?: string | null;
    excludeCategoryId?: string | null;
    authorId?: string | null;
    contentType?: ContentType;
    cursor?: string | null;
    offset?: number;
    limit?: number;
    search?: string;
    publishedFrom?: string;
    publishedTo?: string;
  } = {}
): Promise<{ articles: Article[]; done: boolean; cursor: string | null; total: number }> {
  const limit = opts.limit ?? 24;
  const cursor = decodeCursor(opts.cursor ?? null);
  const offset = Math.max(0, opts.offset ?? 0);
  let query = published(tenantId, CARD_SELECT, "exact")
    .order("published_at", { ascending: false })
    .order("id", { ascending: false });

  if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts.excludeCategoryId) query = query.neq("category_id", opts.excludeCategoryId);
  if (opts.authorId) query = query.eq("author_id", opts.authorId);
  if (opts.contentType) query = query.eq("type", opts.contentType);
  if (opts.search) {
    const q = opts.search.replace(/[%_,"'()\\]/g, " ").replace(/\s+/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
  }
  if (opts.publishedFrom) query = query.gte("published_at", opts.publishedFrom);
  if (opts.publishedTo) query = query.lt("published_at", opts.publishedTo);

  if (offset > 0) {
    query = query.range(offset, offset + limit - 1);
  } else {
    query = query.limit(limit);
  }

  if (cursor) {
    query = query.or(
      `published_at.lt."${cursor.published_at}",and(published_at.eq."${cursor.published_at}",id.lt.${cursor.id})`
    );
  }

  const { data, error, count } = await query;
  if (error) fail(error);
  const articles = ((data ?? []) as unknown as Record<string, unknown>[]).map(mapList);
  const last = articles.at(-1);
  const nextCursor =
    last?.published_at && articles.length === limit
      ? encodeCursor({ published_at: last.published_at, id: last.id })
      : null;
  return {
    articles,
    done: articles.length < limit,
    cursor: nextCursor,
    total: count ?? articles.length,
  };
}

/** Arşiv indeksi: yalnızca yayın tarihleri. */
export async function listPublishedAt(tenantId: string, cap = 20000): Promise<string[]> {
  const out: string[] = [];
  const pageSize = 1000;
  for (let from = 0; from < cap; from += pageSize) {
    const to = Math.min(from + pageSize, cap) - 1;
    const { data, error } = await published(tenantId, "published_at")
      .order("published_at", { ascending: false })
      .range(from, to);
    if (error) fail(error);
    const rows = ((data ?? []) as unknown as { published_at: string | null }[]);
    out.push(...rows.map((r) => r.published_at).filter((d): d is string => Boolean(d)));
    if (rows.length < pageSize) break;
  }
  return out;
}

export async function getArticleBySlug(
  tenantId: string,
  categorySlug: string | null,
  slug: string
): Promise<ReaderArticle | null> {
  const { data, error } = await published(tenantId, READER_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) fail(error);
  if (!data) return null;
  const reader = toReader(data as unknown as Record<string, unknown>);
  if (categorySlug && reader.category_slug && reader.category_slug !== categorySlug) {
    return null;
  }
  return reader;
}

/** Admin önizleme: taslak dahil, tenant_id zorunlu. */
export async function getArticleByIdForAdmin(
  tenantId: string,
  id: string
): Promise<ReaderArticle | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from("articles")
    .select(READER_SELECT)
    .eq("tenant_id", tenantId)
    .eq("id", id)
    .maybeSingle();
  if (error) fail(error);
  if (!data) return null;
  return toReader(data as unknown as Record<string, unknown>);
}

export type SitemapArticle = {
  slug: string;
  title: string;
  published_at: string;
  updated_at: string;
  type: ContentType;
  category_slug: string | null;
  cover_url: string | null;
};

const SITEMAP_PAGE = 1000;
const SITEMAP_MAX = 50000;

/** Sitemap / RSS için published kayıtlar. content_html çekilmez. */
export async function listPublishedSitemapArticles(
  tenantId: string,
  opts: { since?: Date; limit?: number; contentType?: ContentType } = {}
): Promise<SitemapArticle[]> {
  const out: SitemapArticle[] = [];
  const cap = Math.min(opts.limit ?? SITEMAP_MAX, SITEMAP_MAX);
  const pageSize = Math.min(SITEMAP_PAGE, cap);

  for (let from = 0; from < cap; from += pageSize) {
    const to = Math.min(from + pageSize, cap) - 1;
    let query = published(
      tenantId,
      "slug,title,type,published_at,updated_at,cover_url,categories(slug)"
    )
      .order("published_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);
    if (opts.since) query = query.gte("published_at", opts.since.toISOString());
    if (opts.contentType) query = query.eq("type", opts.contentType);
    const { data, error } = await query;
    if (error) fail(error);
    const rows = ((data ?? []) as unknown as Record<string, unknown>[]);
    out.push(
      ...rows.map((r) => {
        const cat = one(r.categories as Rel | Rel[] | null);
        return {
          slug: r.slug as string,
          title: r.title as string,
          published_at: r.published_at as string,
          updated_at: (r.updated_at as string) || (r.published_at as string),
          type: parseContentType(r.type),
          category_slug: cat?.slug ?? null,
          cover_url: (r.cover_url as string | null) ?? null,
        };
      })
    );
    if (rows.length < pageSize) break;
  }
  return out;
}

export async function getCategoryBySlug(
  tenantId: string,
  slug: string
): Promise<Category | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,tenant_id,name,slug,sort_order,meta_title,meta_description")
    .eq("tenant_id", tenantId)
    .eq("slug", slug)
    .maybeSingle();
  if (error && /meta_title|meta_description/.test(error.message)) {
    const retry = await createSupabaseAdminClient()
      .from("categories")
      .select("id,tenant_id,name,slug,sort_order")
      .eq("tenant_id", tenantId)
      .eq("slug", slug)
      .maybeSingle();
    if (retry.error) fail(retry.error);
    return (retry.data as Category | null) ?? null;
  }
  if (error) fail(error);
  return (data as Category | null) ?? null;
}

