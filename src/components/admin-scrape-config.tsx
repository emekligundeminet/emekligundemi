"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ScrapeConfig, ScrapeFeed } from "@/lib/scrape-config";
import { Loader2, Plus, Trash2 } from "lucide-react";

type Props = {
  config: ScrapeConfig;
  loading: boolean;
  saving: boolean;
  onChange: (next: ScrapeConfig) => void;
  onSave: () => void;
};

function setFeed(feeds: ScrapeFeed[], index: number, patch: Partial<ScrapeFeed>) {
  return feeds.map((feed, i) => (i === index ? { ...feed, ...patch } : feed));
}

export function AdminScrapeConfig({ config, loading, saving, onChange, onSave }: Props) {
  if (loading) {
    return <p className="text-sm text-slate-500">Tarama ayarları yükleniyor…</p>;
  }

  return (
    <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-slate-800">RSS kaynakları</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Haber Çek bu adresleri tarar. (Menüdeki Kaynaklar ajans adı/logosudur, burası değil.)
        </p>
      </div>

      <div className="space-y-2">
        {config.feeds.map((feed, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={feed.name}
              placeholder="Kaynak adı (ör. Sözcü)"
              onChange={(e) =>
                onChange({ ...config, feeds: setFeed(config.feeds, index, { name: e.target.value }) })
              }
              className="h-9 sm:max-w-[200px]"
            />
            <Input
              value={feed.url}
              placeholder="https://…/rss"
              onChange={(e) =>
                onChange({ ...config, feeds: setFeed(config.feeds, index, { url: e.target.value }) })
              }
              className="h-9 flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={config.feeds.length <= 1}
              onClick={() =>
                onChange({ ...config, feeds: config.feeds.filter((_, i) => i !== index) })
              }
            >
              <Trash2 className="size-4" />
              Sil
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9"
          onClick={() => onChange({ ...config, feeds: [...config.feeds, { name: "", url: "" }] })}
        >
          <Plus className="size-4" />
          Kaynak ekle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Aranan kelimeler</span>
          <p className="text-xs text-slate-500">
            Satır başına bir kelime/ifade. Boş bırakırsan kaynaktaki tüm haberler gelir.
          </p>
          <Textarea
            rows={8}
            value={config.include.join("\n")}
            onChange={(e) =>
              onChange({
                ...config,
                include: e.target.value.split("\n").map((s) => s.trimEnd()),
              })
            }
            placeholder={"emekli\nSGK\nEYT"}
            className="min-h-36 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-slate-700">Hariç tut</span>
          <p className="text-xs text-slate-500">
            Bunlardan biri geçen haber elenir (ör. spor haberi).
          </p>
          <Textarea
            rows={8}
            value={config.exclude.join("\n")}
            onChange={(e) =>
              onChange({
                ...config,
                exclude: e.target.value.split("\n").map((s) => s.trimEnd()),
              })
            }
            placeholder={"futbol\ntransfer"}
            className="min-h-36 text-sm"
          />
        </label>
      </div>

      <Button type="button" onClick={onSave} disabled={saving} className="h-10 px-4">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        {saving ? "Kaydediliyor…" : "Ayarları kaydet"}
      </Button>
    </div>
  );
}
