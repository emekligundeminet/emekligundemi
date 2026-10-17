"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import type { Category } from "@/types/category";

type StokGorsel = { path: string; kategori: string; url: string; alt: string };

const GENEL = "genel";
const MAX_W = 1920;

/** Her görseli JPEG'e çevirip küçültür (Vercel gövde sınırı + kapak üretici JPEG/PNG okur). */
async function jpegeCevir(file: File): Promise<File> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_W / bmp.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("Görsel işlenemedi.");
  return new File([blob], "stok.jpg", { type: "image/jpeg" });
}

export default function AdminStokPage() {
  const [stoklar, setStoklar] = useState<StokGorsel[]>([]);
  const [kategoriler, setKategoriler] = useState<Category[]>([]);
  const [kategori, setKategori] = useState(GENEL);
  const [loading, setLoading] = useState(true);
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stok");
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Görseller getirilemedi.");
        return;
      }
      setStoklar(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setKategoriler(data.filter((c: Category) => c.slug !== "blog"));
      })
      .catch(() => {});
  }, []);

  const yukle = async (files: FileList) => {
    const liste = Array.from(files).filter((f) => f.type.startsWith("image/"));
    let basarili = 0;
    for (const [i, file] of liste.entries()) {
      setYukleniyor(`${i + 1} / ${liste.length}`);
      try {
        const form = new FormData();
        form.append("file", await jpegeCevir(file));
        form.append("kategori", kategori);
        const res = await fetch("/api/admin/stok", { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(`${file.name}: ${data.message ?? "Yüklenemedi."}`);
          continue;
        }
        basarili += 1;
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : "Yüklenemedi."}`);
      }
    }
    setYukleniyor(null);
    if (basarili > 0) toast.success(`${basarili} görsel yüklendi.`);
    load();
  };

  const sil = async (path: string) => {
    const res = await fetch("/api/admin/stok", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
    });
    if (!res.ok) {
      toast.error("Görsel silinemedi.");
      return;
    }
    setStoklar((s) => s.filter((x) => x.path !== path));
  };

  const altKaydet = async (path: string, alt: string) => {
    const res = await fetch("/api/admin/stok", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, alt }),
    });
    if (!res.ok) {
      toast.error("Açıklama kaydedilemedi.");
      return;
    }
    toast.success("Açıklama kaydedildi.");
  };

  const gruplar = [
    { slug: GENEL, name: "Genel (her kategoriye)" },
    ...kategoriler.map((c) => ({ slug: c.slug, name: c.name })),
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-4">
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Stok görseller</h1>
        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
          Otomatik çekilen haberlere kapak olarak rastgele seçilir; üstüne başlık ve logo basılır.
          Önce haberin kategorisinden, yoksa “Genel”den seçilir. Her görselin altına bir kez
          ne gösterdiğini yazın (ör. “Türk lirası banknotlarını sayan eller”); habere alt metin
          olarak otomatik eklenir. En az 800px genişlikte, telifsiz
          (Pexels, Unsplash, Pixabay) yatay fotoğraflar yükleyin.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 sm:w-64"
        >
          {gruplar.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
        <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
          {yukleniyor ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {yukleniyor ? `Yükleniyor ${yukleniyor}` : "Görsel yükle (çoklu seçilebilir)"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={Boolean(yukleniyor)}
            onChange={(e) => {
              if (e.target.files?.length) yukle(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Yükleniyor…</p>
      ) : (
        <div className="space-y-6">
          {gruplar.map((g) => {
            const resimler = stoklar.filter((s) => s.kategori === g.slug);
            return (
              <section key={g.slug}>
                <h2 className="mb-2 text-sm font-semibold text-slate-700">
                  {g.name} <span className="font-normal text-slate-400">({resimler.length})</span>
                </h2>
                {resimler.length === 0 ? (
                  <p className="text-xs text-slate-400">Henüz görsel yok.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {resimler.map((s) => (
                      <div key={s.path} className="group relative overflow-hidden rounded-lg border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.url} alt={s.alt} className="aspect-video w-full object-cover" loading="lazy" />
                        <input
                          defaultValue={s.alt}
                          placeholder="Görseli tarif edin (alt metin)"
                          maxLength={125}
                          onBlur={(e) => {
                            const alt = e.target.value.trim();
                            if (alt !== s.alt) {
                              s.alt = alt;
                              altKaydet(s.path, alt);
                            }
                          }}
                          className={`w-full border-t px-2 py-1.5 text-xs outline-none focus:bg-indigo-50 ${
                            s.alt ? "border-slate-200 text-slate-700" : "border-amber-300 bg-amber-50 text-slate-700"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => sil(s.path)}
                          className="absolute right-1.5 top-1.5 rounded-md bg-white/90 p-1.5 text-red-600 shadow hover:bg-white"
                          aria-label="Görseli sil"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
