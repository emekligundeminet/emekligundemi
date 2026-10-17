"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { havuzKategorileri } from "@/lib/otomatik/konu";
import { stokYukle } from "@/lib/stok-yukle";

type StokGorsel = { path: string; kategori: string; url: string; alt: string };

const GENEL = "genel";

/**
 * Haber formunda: stok fotoğraf seç → üstüne başlık + logo basılmış kapak
 * üretilir ve habere eklenir. Buradan yüklenen fotoğraf stoğa da girer.
 */
export function StokKapakSecici({
  open,
  onOpenChange,
  baslik,
  kategoriSlug,
  kategoriAdi,
  onSec,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baslik: string;
  kategoriSlug: string | null;
  kategoriAdi: string | null;
  onSec: (url: string, alt: string) => void;
}) {
  const [stoklar, setStoklar] = useState<StokGorsel[]>([]);
  const [loading, setLoading] = useState(false);
  const [kapakBasligi, setKapakBasligi] = useState(baslik);
  const [uretiliyor, setUretiliyor] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hepsi, setHepsi] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stok");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setStoklar(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setKapakBasligi(baslik);
    load();
  }, [open, baslik]);

  const havuz = kategoriSlug ? havuzKategorileri(kategoriSlug) : [];
  const uygun = stoklar.filter((s) => havuz.includes(s.kategori) || s.kategori === GENEL);
  const gosterilen = hepsi || uygun.length === 0 ? stoklar : uygun;

  const uret = async (path: string | null) => {
    if (!kapakBasligi.trim()) {
      toast.error("Önce kapak başlığını yazın.");
      return;
    }
    setUretiliyor(path ?? "kirmizi");
    try {
      const res = await fetch("/api/admin/stok/kapak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, baslik: kapakBasligi, kategori: kategoriAdi }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; alt?: string; message?: string };
      if (!res.ok || !data.url) {
        toast.error(data.message ?? "Kapak üretilemedi.");
        return;
      }
      onSec(data.url, data.alt ?? "");
      toast.success("Kapak hazır.");
      onOpenChange(false);
    } finally {
      setUretiliyor(null);
    }
  };

  const yukle = async (file: File) => {
    setYukleniyor(true);
    try {
      const path = await stokYukle(file, kategoriSlug ?? GENEL);
      toast.success("Fotoğraf stoğa eklendi.");
      await load();
      await uret(path);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yüklenemedi.");
    } finally {
      setYukleniyor(false);
    }
  };

  const mesgul = Boolean(uretiliyor) || yukleniyor;

  return (
    <Dialog open={open} onOpenChange={(o) => !mesgul && onOpenChange(o)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Stoktan kapak seç</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Kapağa yazılacak başlık</label>
          <Input
            value={kapakBasligi}
            onChange={(e) => setKapakBasligi(e.target.value)}
            maxLength={120}
            className="h-9 text-sm"
          />
          <p className="text-[11px] text-slate-400">
            Kısa tutun; 90 karakterden uzunsa kelime sınırından kısaltılır.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label
            className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-700 ${mesgul ? "pointer-events-none opacity-60" : ""}`}
          >
            {yukleniyor ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
            Yeni fotoğraf yükle ve kullan
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={mesgul}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) yukle(f);
                e.target.value = "";
              }}
            />
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            disabled={mesgul}
            onClick={() => uret(null)}
          >
            {uretiliyor === "kirmizi" ? <Loader2 className="size-4 animate-spin" /> : null}
            Fotoğrafsız (kırmızı) kapak
          </Button>
          {uygun.length > 0 && uygun.length < stoklar.length ? (
            <button
              type="button"
              className="text-xs text-indigo-600 underline"
              onClick={() => setHepsi((h) => !h)}
            >
              {hepsi ? "Sadece bu kategoriye uygunlar" : `Tüm stoğu göster (${stoklar.length})`}
            </button>
          ) : null}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Yükleniyor…</p>
        ) : stoklar.length === 0 ? (
          <p className="text-sm text-slate-500">
            Stokta henüz fotoğraf yok. Yukarıdan yükleyin; yüklediğiniz fotoğraf stoğa da eklenir.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {gosterilen.map((s) => (
              <button
                key={s.path}
                type="button"
                disabled={mesgul}
                onClick={() => uret(s.path)}
                className="group relative overflow-hidden rounded-md border border-slate-200 text-left hover:ring-2 hover:ring-indigo-500 disabled:opacity-60"
                title={s.alt || "Bu fotoğrafla kapak üret"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={s.alt} className="aspect-video w-full object-cover" loading="lazy" />
                {uretiliyor === s.path ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-6 animate-spin text-white" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
