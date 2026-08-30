"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Category } from "@/types/category";
import { slugify } from "@/lib/slugify";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(
          data && typeof data === "object" && "message" in data
            ? String((data as { message: string }).message)
            : "Kategoriler getirilemedi."
        );
        setCategories([]);
        return;
      }
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Kategoriler getirilemedi.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("İsim zorunlu.");
      return;
    }
    const finalSlug = slugify(slug || name);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: finalSlug,
        sort_order: Number.parseInt(sortOrder, 10) || 0,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.message ?? "Kategori eklenemedi.");
      return;
    }
    setName("");
    setSlug("");
    setSortOrder("0");
    toast.success("Kategori eklendi.");
    loadCategories();
  };

  const handleUpdate = async (category: Category) => {
    const res = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.message ?? "Kategori güncellenemedi.");
      return;
    }
    toast.success("Kategori güncellendi.");
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Kategori silinemedi.");
      return;
    }
    toast.success("Kategori silindi.");
    loadCategories();
  };

  const setCategory = (index: number, patch: Partial<Category>) => {
    const next = [...categories];
    next[index] = { ...next[index], ...patch };
    setCategories(next);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Kategoriler</h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{categories.length} kategori</p>
      </div>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
        <Input
          placeholder="Kategori adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-lg border-slate-200 text-sm sm:max-w-[200px]"
        />
        <Input
          placeholder="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="h-10 w-full rounded-lg border-slate-200 font-mono text-sm sm:max-w-[160px]"
        />
        <Input
          type="number"
          placeholder="Sıra"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="h-10 w-24 rounded-lg border-slate-200 text-sm"
        />
        <Button onClick={handleCreate} size="sm" className="h-10 rounded-lg px-4 text-sm">
          Ekle
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Yükleniyor…</p>
      ) : categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Henüz kategori yok.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 sm:p-4"
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Input
                  value={category.name}
                  onChange={(e) => setCategory(index, { name: e.target.value })}
                  placeholder="Ad"
                  className="h-8 w-full min-w-0 max-w-[160px] rounded border-slate-200 text-sm sm:max-w-[180px]"
                />
                <Input
                  value={category.slug}
                  onChange={(e) => setCategory(index, { slug: e.target.value })}
                  placeholder="slug"
                  className="h-8 w-full min-w-0 max-w-[120px] rounded border-slate-200 font-mono text-xs sm:max-w-[140px]"
                />
                <Input
                  type="number"
                  value={category.sort_order}
                  onChange={(e) =>
                    setCategory(index, { sort_order: Number.parseInt(e.target.value, 10) || 0 })
                  }
                  className="h-8 w-20 rounded border-slate-200 text-xs"
                  aria-label="Sıra"
                />
                <div className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded px-2 text-xs"
                    onClick={() => handleUpdate(categories[index])}
                  >
                    Kaydet
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 rounded px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(category.id)}
                  >
                    Sil
                  </Button>
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <Input
                  value={category.meta_title ?? ""}
                  onChange={(e) => setCategory(index, { meta_title: e.target.value })}
                  placeholder="Meta başlık (boşsa otomatik)"
                  className="h-8 rounded border-slate-200 text-xs"
                />
                <Textarea
                  value={category.meta_description ?? ""}
                  onChange={(e) => setCategory(index, { meta_description: e.target.value })}
                  placeholder="Meta açıklama (boşsa otomatik)"
                  className="min-h-16 rounded border-slate-200 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
