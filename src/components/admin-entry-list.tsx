"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Article, ArticleStatus } from "@/types/article";
import { Plus, Pencil, Loader2, Search, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

const ROWS_PER_PAGE = 10;

const STATUS_LABEL: Record<ArticleStatus, string> = {
  draft: "Taslak",
  review: "İnceleme",
  published: "Yayında",
};

function statusClass(status: ArticleStatus) {
  if (status === "published") return "rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700";
  if (status === "review") return "rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700";
  return "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700";
}

export function AdminEntryList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" haberini kalıcı olarak silmek istediğinize emin misiniz?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error((data.message as string) || "Silinemedi.");
        return;
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success("Haber silindi.");
    } catch {
      toast.error("Silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return articles;
    const q = search.toLowerCase().trim();
    return articles.filter(
      (a) =>
        a.title?.toLowerCase().includes(q) ||
        a.slug?.toLowerCase().includes(q) ||
        (a.category_name ?? "").toLowerCase().includes(q)
    );
  }, [articles, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const from = (page - 1) * ROWS_PER_PAGE;
  const pageItems = filtered.slice(from, from + ROWS_PER_PAGE);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-6 lg:p-8">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Haberler</h1>
          <p className="mt-0.5 text-sm text-slate-500">Toplam {articles.length} haber</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Ara..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border-0 bg-slate-100 pr-3 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none sm:w-56"
            />
          </div>
          <Link
            href="/admin/articles/create"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="size-4" />
            Yeni Ekle
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-sm text-slate-500">
          <Loader2 className="size-4 animate-spin" />
          Yükleniyor…
        </div>
      ) : articles.length === 0 ? (
        <p className="py-12 text-sm text-slate-500">
          Henüz haber yok.{" "}
          <Link href="/admin/articles/create" className="text-indigo-600 hover:underline">
            Yeni ekle
          </Link>
        </p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pt-0 pr-4 pb-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Başlık
                  </th>
                  <th className="pt-0 pr-4 pb-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Kategori
                  </th>
                  <th className="pt-0 pr-4 pb-3 text-left text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    Durum
                  </th>
                  <th className="w-36 pt-0 pr-0 pb-3 text-right text-xs font-semibold tracking-wider text-slate-400 uppercase" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-slate-50 transition-colors hover:bg-indigo-50/50"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-800">{a.title}</td>
                    <td className="py-3 pr-4 text-slate-500">{a.category_name ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <span className={statusClass(a.status)}>{STATUS_LABEL[a.status]}</span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/preview/${a.id}`}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600"
                        >
                          <Eye className="size-4" />
                          Önizle
                        </Link>
                        <Link
                          href={`/admin/articles/${a.id}/edit`}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-600"
                        >
                          <Pencil className="size-4" />
                          Düzenle
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(a.id, a.title ?? "")}
                          disabled={deletingId === a.id}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === a.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span>
              Sayfa {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-50"
              >
                ←
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
