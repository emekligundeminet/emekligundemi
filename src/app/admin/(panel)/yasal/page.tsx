"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { YasalMarkdown } from "@/components/yasal-markdown";
import { toast } from "sonner";
import type { YasalSayfa } from "@/types/yasal";

export default function AdminYasalPage() {
  const [rows, setRows] = useState<YasalSayfa[]>([]);
  const [slug, setSlug] = useState("");
  const [baslik, setBaslik] = useState("");
  const [icerik, setIcerik] = useState("");
  const [tarih, setTarih] = useState("");
  const [yayinda, setYayinda] = useState(true);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  function apply(row: YasalSayfa) {
    setSlug(row.slug);
    setBaslik(row.baslik);
    setIcerik(row.icerik_md);
    setTarih(row.guncelleme_tarihi.slice(0, 10));
    setYayinda(row.yayinda);
  }

  async function load() {
    const res = await fetch("/api/admin/yasal");
    const data = await res.json();
    if (!res.ok) throw new Error(data.message ?? "Yüklenemedi.");
    const list = (data as YasalSayfa[]) ?? [];
    setRows(list);
    return list;
  }

  useEffect(() => {
    load()
      .then((list) => {
        const first = list[0];
        if (first) apply(first);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  function onSelect(next: string) {
    const row = rows.find((r) => r.slug === next);
    if (row) apply(row);
  }

  async function save() {
    if (!slug) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/yasal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          baslik,
          icerik_md: icerik,
          guncelleme_tarihi: tarih,
          yayinda,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? "Kaydedilemedi.");
        return;
      }
      apply(data as YasalSayfa);
      setRows((prev) => prev.map((r) => (r.slug === data.slug ? (data as YasalSayfa) : r)));
      toast.success("Kaydedildi.");
    } finally {
      setSaving(false);
    }
  }

  async function createNew() {
    const nextSlug = window.prompt("Yeni sayfa slug (ör. gizlilik-ek)");
    if (!nextSlug?.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/yasal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: nextSlug,
          baslik: "Yeni yasal sayfa",
          icerik_md: "",
          yayinda: false,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? "Oluşturulamadı.");
        return;
      }
      const row = data as YasalSayfa;
      setRows((prev) => [...prev, row].sort((a, b) => a.baslik.localeCompare(b.baslik, "tr")));
      apply(row);
      toast.success("Sayfa eklendi.");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <div className="max-w-3xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Yasal sayfalar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Markdown gövde. Tablo için GFM sözdizimi. Kurumsal sayfalar
          /yayin-ilkeleri, /duzeltme, /iletisim, /reklam; diğerleri /yasal/[slug].
          Tokenlar: {"{{email}}"}, {"{{yayin_sahibi}}"}, {"{{sorumlu_mudur}}"},{" "}
          {"{{yonetim_yeri}}"} — künyeden dolar.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[14rem] flex-1 space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor="yasal-slug">
            Sayfa
          </label>
          <select
            id="yasal-slug"
            value={slug}
            onChange={(e) => onSelect(e.target.value)}
            className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
          >
            {rows.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.baslik} ({r.slug})
              </option>
            ))}
          </select>
        </div>
        <Button type="button" variant="outline" onClick={createNew} disabled={creating}>
          Yeni
        </Button>
      </div>

      {slug ? (
        <>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="yasal-baslik">
              Başlık
            </label>
            <Input id="yasal-baslik" value={baslik} onChange={(e) => setBaslik(e.target.value)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="yasal-tarih">
                Güncelleme tarihi
              </label>
              <Input
                id="yasal-tarih"
                type="date"
                value={tarih}
                onChange={(e) => setTarih(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={yayinda}
                onChange={(e) => setYayinda(e.target.checked)}
                className="accent-[var(--brand,#F71515)]"
              />
              Yayında
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant={preview ? "outline" : "default"} onClick={() => setPreview(false)}>
              Markdown
            </Button>
            <Button type="button" variant={preview ? "default" : "outline"} onClick={() => setPreview(true)}>
              Önizleme
            </Button>
          </div>

          {preview ? (
            <div className="rounded-md border border-slate-200 p-4">
              <YasalMarkdown markdown={icerik} />
            </div>
          ) : (
            <Textarea
              value={icerik}
              onChange={(e) => setIcerik(e.target.value)}
              className="min-h-[28rem] font-mono text-sm"
            />
          )}

          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          Kayıt yok. SQL göçünü çalıştır veya Yeni ile sayfa ekle.
        </p>
      )}
    </div>
  );
}
