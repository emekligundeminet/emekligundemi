"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, FolderTree, Loader2, ArrowRight } from "lucide-react";

type Stats = { articles: number; published: number; categories: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/articles").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([articles, categories]) => {
        const list = Array.isArray(articles) ? articles : [];
        setStats({
          articles: list.length,
          published: list.filter((a: { status: string }) => a.status === "published").length,
          categories: Array.isArray(categories) ? categories.length : 0,
        });
      })
      .catch(() => setStats({ articles: 0, published: 0, categories: 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Haberler</p>
          <p className="mt-1 text-3xl font-semibold">{stats?.articles ?? 0}</p>
          <p className="text-xs text-slate-400">{stats?.published ?? 0} yayında</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Kategoriler</p>
          <p className="mt-1 text-3xl font-semibold">{stats?.categories ?? 0}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/articles/create"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <FileText className="size-4" />
          Yeni haber
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <FolderTree className="size-4" />
          Kategoriler
        </Link>
      </div>
    </div>
  );
}
