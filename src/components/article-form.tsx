"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import type { Article, ArticleStatus } from "@/types/article";
import type { Category } from "@/types/category";
import type { Author } from "@/types/author";
import type { Source } from "@/types/source";
import { articlePath, parseContentType, type ContentType } from "@/lib/content-type";
import { coverAltWarning } from "@/lib/cover-alt";
import { ArticleSourcesEditor } from "@/components/article-sources-editor";
import type { Kaynak } from "@/lib/kaynak";
import { DISCOVER_COVER_MIN_WIDTH, publishFieldErrors } from "@/lib/discover";
import { slugify } from "@/lib/slugify";
import { uploadArticleImage } from "@/lib/upload-article-image";
import { toast } from "sonner";
import { ArrowLeft, ImageIcon, Loader2, Eye } from "lucide-react";

type ArticleFormProps = {
  initialData?: Article | null;
};

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "Taslak",
  review: "İnceleme",
  published: "Yayında",
};

const ArticleEditor = dynamic(
  () => import("@/components/article-editor").then((m) => m.ArticleEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[280px] rounded-xl border border-slate-200 bg-slate-50" aria-hidden />
    ),
  }
);

export function ArticleForm({ initialData }: ArticleFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [contentHtml, setContentHtml] = useState(initialData?.content_html ?? "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initialData?.meta_description ?? ""
  );
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url ?? "");
  const [coverUrl, setCoverUrl] = useState<string | null>(initialData?.cover_url ?? null);
  const [coverAlt, setCoverAlt] = useState(initialData?.cover_alt ?? "");
  const [kaynaklar, setKaynaklar] = useState<Kaynak[]>(initialData?.kaynaklar ?? []);
  const [slugLocked, setSlugLocked] = useState(!!initialData?.slug);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [authorId, setAuthorId] = useState(initialData?.author_id ?? "");
  const [sourceId, setSourceId] = useState(initialData?.source_id ?? "");
  const [status, setStatus] = useState<ArticleStatus>(initialData?.status ?? "draft");
  const [isBreaking, setIsBreaking] = useState(Boolean(initialData?.is_breaking));
  const [isManset, setIsManset] = useState(Boolean(initialData?.is_manset));
  const [evergreen, setEvergreen] = useState(Boolean(initialData?.evergreen));
  const [contentType, setContentType] = useState<ContentType>(
    parseContentType(initialData?.type)
  );
  const [canPublish, setCanPublish] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((data) => setAuthors(Array.isArray(data) ? data : []))
      .catch(() => setAuthors([]));
    fetch("/api/admin/sources")
      .then((r) => r.json())
      .then((data) => setSources(Array.isArray(data) ? data : []))
      .catch(() => setSources([]));
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((data) => setCanPublish(data.canPublish !== false))
      .catch(() => setCanPublish(false));
  }, []);

  useEffect(() => {
    if (slugLocked) return;
    setSlug(slugify(title));
  }, [title, slugLocked]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Lütfen bir görsel seçin.");
        return;
      }
      try {
        const bmp = await createImageBitmap(file);
        const width = bmp.width;
        bmp.close();
        if (width < DISCOVER_COVER_MIN_WIDTH) {
          toast.error(`Kapak en az ${DISCOVER_COVER_MIN_WIDTH}px geniş olmalı (Google Keşfet).`);
          e.target.value = "";
          return;
        }
      } catch {
        /* sunucu yine ölçer */
      }
      setUploading(true);
      try {
        const url = await uploadArticleImage(file, "cover", slug || title);
        setCoverUrl(url);
        toast.success("Görsel yüklendi.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Yükleme başarısız.");
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [slug, title]
  );

  const save = useCallback(
    async (nextStatus: ArticleStatus) => {
      if (!canPublish && nextStatus === "published") {
        toast.error("Yazar rolü yayınlayamaz.");
        return;
      }
      const finalSlug = slugify(slug || title);
      if (!title.trim()) {
        toast.error("Başlık gerekli.");
        return;
      }
      if (!finalSlug) {
        toast.error("Slug girin veya başlıktan oluşturun.");
        return;
      }
      if (nextStatus === "published") {
        const ready = publishFieldErrors({
          coverUrl,
          authorId,
          excerpt,
        });
        if (ready[0]) {
          toast.error(ready[0]);
          return;
        }
      }

      setSaving(true);
      try {
        const payload = {
          title: title.trim(),
          slug: finalSlug,
          category_id: categoryId || null,
          content_html: contentHtml,
          excerpt: excerpt.trim() || null,
          meta_title: metaTitle.trim() || null,
          meta_description: metaDescription.trim() || null,
          canonical_url: canonicalUrl.trim() || null,
          cover_url: coverUrl,
          cover_alt: coverAlt.trim() || null,
          kaynaklar,
          author_id: authorId || null,
          source_id: sourceId || null,
          status: nextStatus,
          is_breaking: isBreaking,
          is_manset: isManset,
          evergreen,
          type: contentType,
        };
        const bodyText = JSON.stringify(payload);
        if (bodyText.length > 3_200_000) {
          toast.error(
            "Kayıt çok büyük (yapıştırılmış görsel olabilir). Fotoğrafı Kapak veya editördeki Yükle ile ekleyin."
          );
          return;
        }
        const res = await fetch(
          isEdit ? `/api/admin/articles/${initialData!.id}` : "/api/admin/articles",
          {
            method: isEdit ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyText,
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(
            typeof data.message === "string" && data.message
              ? data.message
              : `Kaydedilemedi (${res.status}).`
          );
          return;
        }
        setStatus(nextStatus);
        toast.success(
          nextStatus === "published"
            ? "Yayınlandı."
            : nextStatus === "review"
              ? "İncelemeye alındı."
              : "Taslak kaydedildi."
        );
        if (typeof data.slug === "string" && data.slug !== finalSlug) {
          setSlug(data.slug);
          toast.message(
            `Bu URL kullanımdaydı, kayıt ${articlePath({ slug: data.slug, type: contentType })} olarak yapıldı.`
          );
        } else if (typeof data.slug === "string") {
          setSlug(data.slug);
        }
        if (!isEdit && data.id) {
          window.location.href = `/admin/articles/${data.id}/edit`;
        }
      } catch {
        toast.error("Bir hata oluştu.");
      } finally {
        setSaving(false);
      }
    },
    [
      isEdit,
      initialData,
      title,
      slug,
      categoryId,
      contentHtml,
      excerpt,
      metaTitle,
      metaDescription,
      coverUrl,
      coverAlt,
      kaynaklar,
      canonicalUrl,
      authorId,
      sourceId,
      canPublish,
      isBreaking,
      isManset,
      evergreen,
      contentType,
    ]
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/articles" aria-label="Listeye dön">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold sm:text-2xl">
          {isEdit ? "Haberi Düzenle" : "Yeni Haber"}
        </h1>
        {isEdit && initialData?.id ? (
          <Button variant="outline" size="sm" asChild className="ml-auto">
            <Link href={`/admin/preview/${initialData.id}`} target="_blank">
              <Eye className="size-4" />
              Önizle
            </Link>
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,3fr)] lg:gap-6">
        <div className="order-2 min-w-0 lg:order-1">
          <div className="mb-3 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <label className="text-sm font-medium text-slate-700">Özet</label>
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Başlığın hemen altında görünecek özet"
              rows={3}
              className="resize-y text-sm"
            />
          </div>
          <div className="flex min-h-[420px] flex-col lg:min-h-[calc(100vh-10rem)]">
            <ArticleEditor
              value={contentHtml}
              onChange={setContentHtml}
              placeholder="Haber gövdesi."
              minHeight="280px"
              className="flex h-full min-h-0 flex-col"
              excludeArticleId={initialData?.id}
              categoryId={categoryId}
            />
          </div>
          <ArticleSourcesEditor value={kaynaklar} onChange={setKaynaklar} />
        </div>

        <aside className="order-1 flex flex-col gap-4 lg:sticky lg:top-4 lg:order-2 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Başlık (H1)</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Haber başlığı"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-medium text-slate-700">Slug</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 shrink-0 text-xs"
                  onClick={() => {
                    setSlug(slugify(title));
                    setSlugLocked(true);
                  }}
                >
                  Başlıktan
                </Button>
              </div>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlugLocked(true);
                  setSlug(e.target.value);
                }}
                placeholder="url-slug"
                className="h-9 font-mono text-sm"
              />
              <p className="truncate text-[11px] text-slate-500">
                {articlePath({ slug: slug || "…", type: contentType })}
              </p>
            </div>

            <fieldset className="space-y-1.5">
              <legend className="text-sm font-medium text-slate-700">İçerik tipi</legend>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="content-type"
                    checked={contentType === "news"}
                    onChange={() => setContentType("news")}
                    className="accent-[var(--brand,#F71515)]"
                  />
                  Haber
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="content-type"
                    checked={contentType === "guide"}
                    onChange={() => setContentType("guide")}
                    className="accent-[var(--brand,#F71515)]"
                  />
                  Rehber
                </label>
              </div>
              <p className="text-[11px] text-slate-500">
                Haber anasayfada ve Google News’te; rehber /blog altında. Kategori yalnızca konu.
              </p>
            </fieldset>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kategori (konu)</label>
              <Select
                value={categoryId || "none"}
                onValueChange={(v) => setCategoryId(v === "none" ? "" : v)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kategori seçin</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Yazar</label>
              <Select
                value={authorId || "none"}
                onValueChange={(v) => setAuthorId(v === "none" ? "" : v)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Yazar seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Yazar yok</SelectItem>
                  {authors.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Ajans / kaynak</label>
              <Select
                value={sourceId || "none"}
                onValueChange={(v) => setSourceId(v === "none" ? "" : v)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Kaynak seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kaynak yok</SelectItem>
                  {sources.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Durum</label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as ArticleStatus)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{STATUS_LABEL.draft}</SelectItem>
                  <SelectItem value="review">{STATUS_LABEL.review}</SelectItem>
                  {canPublish ? (
                    <SelectItem value="published">{STATUS_LABEL.published}</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <input
                type="checkbox"
                className="mt-0.5 size-4"
                checked={isManset}
                onChange={(e) => setIsManset(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-slate-700">Manşet</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Anasayfadaki 4 kart. 5. tikte en eski tarihli manşet düşer.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <input
                type="checkbox"
                className="mt-0.5 size-4"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-slate-700">Son dakika</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Anasayfa bandındaki 3 haber. 4. tikte en eski tarihli son dakika düşer.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
              <input
                type="checkbox"
                className="mt-0.5 size-4"
                checked={evergreen}
                onChange={(e) => setEvergreen(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-medium text-slate-700">
                  Evergreen (iç link hedefi)
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  Yayınlandıktan sonra diğer yazılarda Link modalında çıkar.
                </span>
              </span>
            </label>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Meta başlık (SEO)</label>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Sekme / arama başlığı"
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Meta açıklama (SEO)</label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="140–160 karakter"
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Canonical URL (opsiyonel)</label>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://…"
                className="h-9 font-mono text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kapak görseli</label>
              <p className="text-xs text-slate-500">
                Google Keşfet: en az {DISCOVER_COVER_MIN_WIDTH}px geniş, haberin kendisine ait.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="h-9 cursor-pointer text-xs file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs file:cursor-pointer"
                    />
                    {uploading && <Loader2 className="size-4 shrink-0 animate-spin text-slate-400" />}
                  </div>
                  <Input
                    value={coverUrl ?? ""}
                    onChange={(e) => setCoverUrl(e.target.value.trim() || null)}
                    placeholder="veya görsel URL’si yapıştır"
                    className="h-8 font-mono text-xs"
                  />
                {coverUrl ? (
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-md border bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverUrl}
                        alt={coverAlt || "Kapak"}
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        value={coverAlt}
                        onChange={(e) => setCoverAlt(e.target.value)}
                        placeholder="Görseli tarif eden cümle (ör. TBMM Genel Kurulu salonu)"
                        className="h-8 text-sm"
                      />
                      {coverAltWarning(coverAlt) ? (
                        <p className="text-[11px] leading-snug text-amber-600">
                          {coverAltWarning(coverAlt)}
                        </p>
                      ) : (
                        <p className="text-[11px] leading-snug text-slate-400">
                          Alt metni sayfada görünmez; ekran okuyucular ve Google Görseller için.
                          Boş bırakırsan haber başlığı kullanılır.
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-full text-xs"
                      onClick={() => {
                        setCoverUrl(null);
                        setCoverAlt("");
                      }}
                    >
                      Görseli kaldır
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-20 w-full items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                    <span className="flex items-center gap-1.5 text-xs">
                      <ImageIcon className="size-3.5" />
                      Görsel yok
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 pt-2">
              {canPublish ? (
                <Button
                  type="button"
                  className="w-full"
                  disabled={saving}
                  onClick={() => save("published")}
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Yayınla
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={saving}
                onClick={() => save(status === "published" && !canPublish ? "review" : status)}
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Kaydet ({STATUS_LABEL[status]})
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={saving}
                onClick={() => save("draft")}
              >
                Taslak kaydet
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
