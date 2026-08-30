"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Download, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminScrapeConfig } from "@/components/admin-scrape-config";
import { govdeToHtml, haberSlug } from "@/lib/haber-draft";
import { DEFAULT_SCRAPE_CONFIG, type ScrapeConfig } from "@/lib/scrape-config";
import type { CekilenHaber } from "@/types/cekilen";

function payload(config: ScrapeConfig): ScrapeConfig {
  return {
    feeds: config.feeds.filter((f) => f.name.trim() && f.url.trim()),
    include: config.include.map((s) => s.trim()).filter(Boolean),
    exclude: config.exclude.map((s) => s.trim()).filter(Boolean),
  };
}

export default function AdminCekPage() {
  const [cekiliyor, setCekiliyor] = useState(false);
  const [haberler, setHaberler] = useState<CekilenHaber[]>([]);
  const [mesaj, setMesaj] = useState("");
  const [gonderilen, setGonderilen] = useState<Set<string>>(new Set());
  const [acikId, setAcikId] = useState<string | null>(null);
  const [config, setConfig] = useState<ScrapeConfig>(DEFAULT_SCRAPE_CONFIG);
  const [configLoading, setConfigLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/cek")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config as ScrapeConfig);
      })
      .catch(() => toast.error("Tarama ayarları yüklenemedi."))
      .finally(() => setConfigLoading(false));
  }, []);

  const kaydet = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cek", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(config)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? "Kaydedilemedi.");
        return false;
      }
      if (data.config) setConfig(data.config as ScrapeConfig);
      toast.success("Tarama ayarları kaydedildi.");
      return true;
    } catch {
      toast.error("Kaydedilemedi.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const cek = async () => {
    setCekiliyor(true);
    setHaberler([]);
    setGonderilen(new Set());
    setMesaj("RSS ve gövdeler okunuyor… Bu 15–20 saniye sürebilir.");
    try {
      const res = await fetch("/api/admin/cek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(config)),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Çekilemedi.");
        setMesaj(data.message ?? "");
        return;
      }
      setHaberler(data.haberler ?? []);
      setMesaj(data.mesaj ?? "");
      toast.success(data.mesaj ?? "Tarama bitti.");
    } catch {
      toast.error("Çekilemedi.");
      setMesaj("");
    } finally {
      setCekiliyor(false);
    }
  };

  const taslagaYolla = async (haber: CekilenHaber) => {
    setGonderilen((prev) => new Set(prev).add(haber.id));
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: haber.baslik,
          slug: haberSlug(haber),
          content_html: govdeToHtml(haber),
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Taslağa eklenemedi.");
        setGonderilen((prev) => {
          const next = new Set(prev);
          next.delete(haber.id);
          return next;
        });
        return;
      }
      setHaberler((prev) => prev.filter((h) => h.id !== haber.id));
      toast.success("Taslak olarak kaydedildi. Haberler’den yayınlayabilirsin.");
    } catch {
      toast.error("Taslağa eklenemedi.");
      setGonderilen((prev) => {
        const next = new Set(prev);
        next.delete(haber.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Haber Çek</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            RSS kaynaklarını ve kelimeleri aşağıdan değiştir. Tarama yalnızca bu makinede{" "}
            <code className="rounded bg-slate-100 px-1">npm run dev</code> ile çalışır.
          </p>
        </div>
        <Button onClick={cek} disabled={cekiliyor || configLoading} className="h-10 px-5">
          {cekiliyor ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {cekiliyor ? "Haberler çekiliyor…" : "Haber Çek"}
        </Button>
      </div>

      <AdminScrapeConfig
        config={config}
        loading={configLoading}
        saving={saving}
        onChange={setConfig}
        onSave={() => void kaydet()}
      />

      {mesaj ? <p className="text-sm text-slate-500">{mesaj}</p> : null}

      {haberler.length === 0 && !cekiliyor ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Henüz tarama yok. Ayarları kaydet, Haber Çek’e bas, beğendiğini taslağa yolla.
        </p>
      ) : (
        <ul className="space-y-3">
          {haberler.map((h) => {
            const acik = acikId === h.id;
            return (
              <li
                key={h.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                      {h.kaynak}
                    </p>
                    <h2 className="mt-1 font-semibold text-slate-800">{h.baslik}</h2>
                    <p className="mt-1 text-xs text-slate-400">{h.tarih}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={gonderilen.has(h.id)}
                    onClick={() => taslagaYolla(h)}
                  >
                    {gonderilen.has(h.id) ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <FilePlus className="size-4" />
                    )}
                    Taslağa yolla
                  </Button>
                </div>
                <button
                  type="button"
                  className="mt-3 text-xs font-medium text-slate-500 hover:text-slate-800"
                  onClick={() => setAcikId(acik ? null : h.id)}
                >
                  {acik ? "Gövdeyi gizle" : "Gövdeyi göster"}
                </button>
                {acik ? (
                  <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {h.govde}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-slate-400">
        Taslaklar <Link href="/admin/articles" className="underline">Haberler</Link> listesinde durur.
        Oradan düzenleyip yayınlarsın.
      </p>
    </div>
  );
}
