"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import type { Source } from "@/types/source";
import { uploadArticleImage } from "@/lib/upload-article-image";

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sources");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Kaynaklar getirilemedi.");
        setSources([]);
        return;
      }
      setSources(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Kaynaklar getirilemedi.");
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Kaynak adı zorunlu.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logo_url: logoUrl }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message ?? "Kaynak eklenemedi.");
        return;
      }
      setName("");
      setLogoUrl(null);
      toast.success("Kaynak eklendi.");
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (source: Source) => {
    const res = await fetch("/api/admin/sources", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(source),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.message ?? "Kaynak güncellenemedi.");
      return;
    }
    toast.success("Kaynak güncellendi.");
    load();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/admin/sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Kaynak silinemedi.");
      return;
    }
    toast.success("Kaynak silindi.");
    load();
  };

  const setSource = (index: number, patch: Partial<Source>) => {
    const next = [...sources];
    next[index] = { ...next[index], ...patch };
    setSources(next);
  };

  const uploadLogo = async (
    file: File,
    onDone: (url: string) => void,
    onBusy: (busy: boolean) => void
  ) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel seçin.");
      return;
    }
    onBusy(true);
    try {
      const url = await uploadArticleImage(file, "mark");
      onDone(url);
      toast.success("Logo yüklendi.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      onBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Kaynaklar / ajanslar</h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          Habere seçilirse kaynak adı ve logosu görünür. Haber formundaki dropdown buradan dolar.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          placeholder="Kaynak adı (ör. AA)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-lg border-slate-200 text-sm sm:max-w-[240px]"
        />
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 hover:bg-slate-100">
          {uploadingNew ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
          Logo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploadingNew}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) uploadLogo(file, setLogoUrl, setUploadingNew);
            }}
          />
        </label>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : null}
        <Button onClick={handleCreate} size="sm" disabled={saving} className="h-10 rounded-lg px-4 text-sm">
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Ekle
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Yükleniyor…</p>
      ) : sources.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Henüz kaynak yok.</p>
      ) : (
        <div className="space-y-3">
          {sources.map((source, index) => (
            <div
              key={source.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
            >
              {source.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={source.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-500">
                  {source.name.trim().slice(0, 1).toLocaleUpperCase("tr")}
                </span>
              )}
              <Input
                value={source.name}
                onChange={(e) => setSource(index, { name: e.target.value })}
                placeholder="Ad"
                className="h-8 w-full min-w-0 max-w-[220px] rounded border-slate-200 text-sm"
              />
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-slate-200 bg-white px-2 text-xs text-slate-600 hover:bg-slate-50">
                {uploadingId === source.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="size-3.5" />
                )}
                Logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingId === source.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    uploadLogo(
                      file,
                      (url) => setSource(index, { logo_url: url }),
                      (busy) => setUploadingId(busy ? source.id : null)
                    );
                  }}
                />
              </label>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded px-2 text-xs"
                  onClick={() => handleUpdate(sources[index])}
                >
                  Kaydet
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(source.id)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
