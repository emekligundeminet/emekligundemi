"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageIcon, Loader2 } from "lucide-react";
import { uploadArticleImage } from "@/lib/upload-article-image";

type Settings = {
  site_name?: string;
  logo_url?: string;
  description?: string;
  primary_color?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  adsense_client?: string;
  adsense_slot?: string;
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => setForm((data.settings as Settings) ?? {}))
      .catch(() => toast.error("Ayarlar yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof Settings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? "Kaydedilemedi.");
        return;
      }
      setForm((data.settings as Settings) ?? form);
      toast.success("Site ayarları kaydedildi.");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel seçin.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadArticleImage(file);
      set("logo_url", url);
      toast.success("Logo yüklendi. Kaydet’e basın.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <div className="max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Site ayarları</h1>
        <p className="mt-1 text-sm text-slate-500">
          Publisher adı ve logosu Google Discover / JSON-LD için buradan gelir. Logonun yüksekliği en az
          112px olmalı.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Site adı</label>
        <Input value="Emekliler" disabled className="bg-slate-100" />
        <p className="text-xs text-slate-500">
          Sekme başlığı sabit: sayfa adı | Emekliler.org. Haber detayında eklenmez.
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Açıklama</label>
        <Textarea
          rows={2}
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Logo</label>
        <p className="text-xs text-slate-500">
          Discover publisher logosu. Google en az 112px yükseklik ister; kare veya yatay PNG/SVG yükleyin.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 hover:bg-slate-100">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImageIcon className="size-4" />}
            Yükle
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void uploadLogo(file);
              }}
            />
          </label>
          <Input
            placeholder="veya logo URL’si"
            value={form.logo_url ?? ""}
            onChange={(e) => set("logo_url", e.target.value)}
            className="min-w-[12rem] flex-1"
          />
        </div>
        {form.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.logo_url} alt="Logo önizleme" className="mt-2 h-16 w-auto object-contain" />
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">Ana renk</label>
        <Input
          placeholder="#F71515"
          value={form.primary_color ?? ""}
          onChange={(e) => set("primary_color", e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Twitter / X</label>
          <Input value={form.twitter ?? ""} onChange={(e) => set("twitter", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Facebook</label>
          <Input value={form.facebook ?? ""} onChange={(e) => set("facebook", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Instagram</label>
          <Input value={form.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700">WhatsApp kanalı</label>
        <p className="text-xs text-slate-500">
          WhatsApp’ta kanal açıp bağlantıyı yapıştırın. Boşsa ikon ve haber altı butonu görünmez.
        </p>
        <Input
          placeholder="https://www.whatsapp.com/channel/…"
          value={form.whatsapp ?? ""}
          onChange={(e) => set("whatsapp", e.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Reklam client ID</label>
          <Input
            value={form.adsense_client ?? ""}
            onChange={(e) => set("adsense_client", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">Reklam slot ID</label>
          <Input
            value={form.adsense_slot ?? ""}
            onChange={(e) => set("adsense_slot", e.target.value)}
          />
        </div>
      </div>

      <Button onClick={() => void save()} disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        Kaydet
      </Button>
    </div>
  );
}
