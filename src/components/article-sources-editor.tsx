"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KAYNAK_MAX, type Kaynak } from "@/lib/kaynak";

type Props = {
  value: Kaynak[];
  onChange: (next: Kaynak[]) => void;
};

const BOS: Kaynak = { etiket: "", url: "", dofollow: false };

function urlUyarisi(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Yalnızca http/https adresleri kaydedilir.";
    }
    return null;
  } catch {
    return "Geçerli bir adres değil; başına https:// ekleyin.";
  }
}

/** Yazının sonunda çıkan kaynak listesi. Boş satırlar kaydedilmez. */
export function ArticleSourcesEditor({ value, onChange }: Props) {
  const rows = value.length > 0 ? value : [];

  const patch = (i: number, next: Partial<Kaynak>) =>
    onChange(rows.map((row, j) => (i === j ? { ...row, ...next } : row)));

  const move = (i: number, delta: number) => {
    const hedef = i + delta;
    if (hedef < 0 || hedef >= rows.length) return;
    const kopya = [...rows];
    [kopya[i], kopya[hedef]] = [kopya[hedef], kopya[i]];
    onChange(kopya);
  };

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-slate-700">Kaynaklar</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Yazının sonunda ayrı bir blokta listelenir. Linkler yeni sekmede ve
            varsayılan olarak nofollow açılır.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 shrink-0 text-xs"
          disabled={rows.length >= KAYNAK_MAX}
          onClick={() => onChange([...rows, { ...BOS }])}
        >
          <Plus className="mr-1 size-3.5" />
          Kaynak ekle
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-xs text-slate-400">
          Kaynak yok. Blok yayında hiç görünmez.
        </p>
      ) : null}

      {rows.map((row, i) => {
        const uyari = urlUyarisi(row.url);
        return (
          <div
            key={i}
            className="space-y-2 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="flex items-start gap-2">
              <span className="mt-2 w-4 shrink-0 text-xs font-medium text-slate-400">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <Input
                  value={row.etiket}
                  onChange={(e) => patch(i, { etiket: e.target.value })}
                  placeholder="Görünen metin (ör. Resmî Gazete, 13.07.2026 Cumhurbaşkanı Kararı)"
                  className="h-8 text-sm"
                />
                <Input
                  value={row.url}
                  onChange={(e) => patch(i, { url: e.target.value })}
                  placeholder="https://www.resmigazete.gov.tr/..."
                  className="h-8 font-mono text-xs"
                />
                {uyari ? <p className="text-[11px] text-amber-600">{uyari}</p> : null}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  aria-label="Yukarı taşı"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0"
                  disabled={i === rows.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label="Aşağı taşı"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="size-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onChange(rows.filter((_, j) => j !== i))}
                  aria-label="Kaynağı sil"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 pl-6 text-xs text-slate-600">
              <input
                type="checkbox"
                className="size-3.5"
                checked={row.dofollow}
                onChange={(e) => patch(i, { dofollow: e.target.checked })}
              />
              dofollow ver
              <span className="text-slate-400">
                — kapalıyken nofollow. Yalnızca resmî kurum kaynaklarında açın.
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
