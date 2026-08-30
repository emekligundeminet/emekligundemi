"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import type { Author } from "@/types/author";
import { uploadArticleImage } from "@/lib/upload-article-image";

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/authors");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Yazarlar getirilemedi.");
        setAuthors([]);
        return;
      }
      setAuthors(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Yazarlar getirilemedi.");
      setAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Yazar adı zorunlu.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), logo_url: logoUrl, bio: bio.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message ?? "Yazar eklenemedi.");
        return;
      }
      setName("");
      setBio("");
      setLogoUrl(null);
      toast.success("Yazar eklendi.");
      loadAuthors();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (author: Author) => {
    const res = await fetch("/api/admin/authors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(author),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.message ?? "Yazar güncellenemedi.");
      return;
    }
    toast.success("Yazar güncellendi.");
    loadAuthors();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch("/api/admin/authors", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      toast.error("Yazar silinemedi.");
      return;
    }
    toast.success("Yazar silindi.");
    loadAuthors();
  };

  const setAuthor = (index: number, patch: Partial<Author>) => {
    const next = [...authors];
    next[index] = { ...next[index], ...patch };
    setAuthors(next);
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
      const url = await uploadArticleImage(file);
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
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Yazarlar</h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          {authors.length} yazar. Habere seçilirse sitede /yazar altında sayfası ve imza linki çıkar.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          placeholder="Yazar adı (ör. Haber Merkezi)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-10 w-full rounded-lg border-slate-200 text-sm sm:max-w-[240px]"
        />
        <Textarea
          placeholder="Kısa bio (opsiyonel)"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={2}
          className="w-full max-w-md text-sm"
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
              if (file) {
                uploadLogo(file, setLogoUrl, setUploadingNew);
              }
            }}
          />
        </label>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : null}
        <Button
          onClick={handleCreate}
          size="sm"
          disabled={saving}
          className="h-10 rounded-lg px-4 text-sm"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Ekle
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Yükleniyor…</p>
      ) : authors.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">Henüz yazar yok.</p>
      ) : (
        <div className="space-y-3">
          {authors.map((author, index) => (
            <div
              key={author.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
            >
              {author.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={author.logo_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-500">
                  {author.name.trim().slice(0, 1).toLocaleUpperCase("tr")}
                </span>
              )}
              <Input
                value={author.name}
                onChange={(e) => setAuthor(index, { name: e.target.value })}
                placeholder="Ad"
                className="h-8 w-full min-w-0 max-w-[220px] rounded border-slate-200 text-sm"
              />
              <Textarea
                value={author.bio ?? ""}
                onChange={(e) => setAuthor(index, { bio: e.target.value })}
                placeholder="Bio"
                rows={2}
                className="w-full max-w-sm text-sm"
              />
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded border border-slate-200 bg-white px-2 text-xs text-slate-600 hover:bg-slate-50">
                {uploadingId === author.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="size-3.5" />
                )}
                Logo değiştir
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingId === author.id}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    uploadLogo(
                      file,
                      (url) => setAuthor(index, { logo_url: url }),
                      (busy) => setUploadingId(busy ? author.id : null)
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
                  onClick={() => handleUpdate(authors[index])}
                >
                  Kaydet
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 rounded px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(author.id)}
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
