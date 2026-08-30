"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type LinkTarget = {
  id: string;
  title: string;
  path: string;
  category_id?: string | null;
  category_name?: string | null;
};

function matchesQuery(title: string, q: string) {
  if (!q) return true;
  return title.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr"));
}

export function EvergreenLinkPicker({
  open,
  onOpenChange,
  excludeId,
  categoryId,
  selectedText,
  linkCount,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeId?: string;
  categoryId?: string;
  selectedText: string;
  linkCount: number;
  onInsert: (href: string, anchor: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<LinkTarget[]>([]);
  const [tools, setTools] = useState<LinkTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<LinkTarget | null>(null);
  const [anchor, setAnchor] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setPicked(null);
    setCustomUrl("");
    setAnchor(selectedText.trim());
    setLoading(true);
    const params = excludeId ? `?excludeId=${encodeURIComponent(excludeId)}` : "";
    fetch(`/api/admin/evergreen-targets${params}`)
      .then((r) => r.json())
      .then((data) => {
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setTools(Array.isArray(data.tools) ? data.tools : []);
      })
      .catch(() => {
        setArticles([]);
        setTools([]);
      })
      .finally(() => setLoading(false));
  }, [open, excludeId, selectedText]);

  const filteredArticles = useMemo(() => {
    const rows = articles.filter((a) => matchesQuery(a.title, query));
    if (!categoryId) return rows;
    return [...rows].sort((a, b) => {
      const am = a.category_id === categoryId ? 0 : 1;
      const bm = b.category_id === categoryId ? 0 : 1;
      return am - bm;
    });
  }, [articles, query, categoryId]);

  const filteredTools = useMemo(
    () => tools.filter((t) => matchesQuery(t.title, query)),
    [tools, query]
  );

  function choose(target: LinkTarget) {
    setPicked(target);
    setCustomUrl("");
    if (!selectedText.trim()) setAnchor(target.title);
  }

  function apply() {
    const href = (picked?.path || customUrl).trim();
    const text = anchor.trim() || picked?.title || "";
    if (!href || !text) return;
    onInsert(href, text);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>İç link ekle</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {linkCount > 4 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Bu yazıda {linkCount} link var. 4’ü aşmak spam sinyali olabilir.
            </p>
          ) : (
            <p className="text-xs text-slate-500">Bu yazıda {linkCount} link</p>
          )}

          <Input
            placeholder="Başlıkta ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="max-h-56 space-y-3 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/60 p-2">
            {loading ? (
              <p className="px-1 py-4 text-center text-sm text-slate-500">Yükleniyor…</p>
            ) : (
              <>
                <TargetGroup
                  label="Evergreen içerikler"
                  empty="İşaretlenmiş yayın yok. Haberi kaydederken Evergreen kutusunu işaretle."
                  items={filteredArticles}
                  pickedId={picked?.id}
                  onChoose={choose}
                />
                <TargetGroup
                  label="Hesaplama araçları"
                  empty="Araç bulunamadı."
                  items={filteredTools}
                  pickedId={picked?.id}
                  onChoose={choose}
                />
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Görünen metin</label>
            <Input
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder="Seçili kelime veya başlık"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">veya dış URL</label>
            <Input
              placeholder="https://…"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setPicked(null);
              }}
            />
          </div>

          <Button
            onClick={apply}
            className="w-full"
            disabled={!anchor.trim() || !(picked?.path || customUrl.trim())}
          >
            Ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TargetGroup({
  label,
  empty,
  items,
  pickedId,
  onChoose,
}: {
  label: string;
  empty: string;
  items: LinkTarget[];
  pickedId?: string;
  onChoose: (item: LinkTarget) => void;
}) {
  return (
    <div>
      <p className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="px-1 text-xs text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChoose(item)}
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  pickedId === item.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-800 hover:bg-white"
                }`}
              >
                <span className="block font-medium leading-snug">{item.title}</span>
                <span
                  className={`block truncate font-mono text-[11px] ${
                    pickedId === item.id ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  {item.category_name ? `${item.category_name} · ` : ""}
                  {item.path}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
