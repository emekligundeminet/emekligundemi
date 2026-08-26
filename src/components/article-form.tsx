"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArticleEditor } from "@/components/article-editor";
import type { Article } from "@/types/article";
import type { Category } from "@/types/category";
import { slugify } from "@/lib/slugify";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

type ArticleFormProps = {
  initialData?: Article | null;
};

export function ArticleForm({ initialData }: ArticleFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initialData?.id;

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  const generateSlug = useCallback(() => {
    setSlug(slugify(title));
  }, [title]);

  const save = useCallback(
    async (status: "draft" | "published") => {
      const finalSlug = slugify(slug || title);
      if (!title.trim()) {
        toast.error("Başlık gerekli.");
        return;
      }
      if (!finalSlug) {
        toast.error("Slug girin veya başlıktan oluşturun.");
        return;
      }

      setSaving(true);
      try {
        const payload = {
          title: title.trim(),
          slug: finalSlug,
          category: category.trim() || null,
          content,
          status,
        };
        const res = await fetch(
          isEdit ? `/api/admin/articles/${initialData!.id}` : "/api/admin/articles",
          {
            method: isEdit ? "PATCH" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(data.message ?? "Kaydedilemedi.");
          return;
        }
        toast.success(status === "published" ? "Yayınlandı." : "Taslak kaydedildi.");
        if (!isEdit && data.id) {
          window.location.href = `/admin/articles/${data.id}/edit`;
        }
      } catch {
        toast.error("Bir hata oluştu.");
      } finally {
        setSaving(false);
      }
    },
    [isEdit, initialData, title, slug, category, content]
  );

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/articles" aria-label="Haberlere dön">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold sm:text-2xl">
          {isEdit ? "Haberi Düzenle" : "Yeni Haber"}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,6fr)_minmax(0,3fr)] lg:gap-6">
        <div className="order-2 min-w-0 lg:order-1">
          <div className="flex min-h-[420px] flex-col lg:min-h-[calc(100vh-10rem)]">
            <ArticleEditor
              value={content}
              onChange={setContent}
              placeholder="Haber içeriği (H2, H3, kalın, liste, link, tablo)"
              minHeight="280px"
              className="flex h-full min-h-0 flex-col"
            />
          </div>
        </div>

        <aside className="order-1 flex flex-col gap-4 lg:sticky lg:top-4 lg:order-2 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Başlık</label>
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
                  onClick={generateSlug}
                >
                  Başlıktan
                </Button>
              </div>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="h-9 font-mono text-sm"
              />
              <p className="truncate text-[11px] text-slate-500">/haber/{slug || "…"}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Kategori</label>
              <Select
                value={category || "none"}
                onValueChange={(v) => setCategory(v === "none" ? "" : v)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kategori seçin</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200 pt-2">
              <Button type="button" className="w-full" disabled={saving} onClick={() => save("published")}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Yayınla
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={saving}
                onClick={() => save("draft")}
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Taslak kaydet
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
