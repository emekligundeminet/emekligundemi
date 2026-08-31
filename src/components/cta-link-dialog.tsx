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
import type { IcLinkCtaAttrs } from "@/lib/tiptap/ic-link-cta";

type Target = {
  id: string;
  title: string;
  path: string;
  category_name?: string | null;
};

const KICKER_REHBER = "Bunu da inceleyebilirsiniz";
const KICKER_ARAC = "Kendi maaşınızı hesaplayabilirsiniz";

const KICKER_HAZIR = [
  "Bunu da inceleyebilirsiniz",
  "İlginizi çekebilir",
  "Ayrıntılar için",
  "Kendi maaşınızı hesaplayabilirsiniz",
  "Adım adım anlattık",
];

function matches(title: string, q: string) {
  if (!q) return true;
  return title.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase("tr"));
}

export function CtaLinkDialog({
  open,
  onOpenChange,
  excludeId,
  onInsert,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeId?: string;
  onInsert: (attrs: IcLinkCtaAttrs) => void;
}) {
  const [query, setQuery] = useState("");
  const [guides, setGuides] = useState<Target[]>([]);
  const [tools, setTools] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Target | null>(null);
  const [anchor, setAnchor] = useState("");
  const [kicker, setKicker] = useState(KICKER_REHBER);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setPicked(null);
    setAnchor("");
    setKicker(KICKER_REHBER);
    setLoading(true);
    const params = excludeId ? `?excludeId=${encodeURIComponent(excludeId)}` : "";
    fetch(`/api/admin/cta-targets${params}`)
      .then((r) => r.json())
      .then((data) => {
        setGuides(Array.isArray(data.guides) ? data.guides : []);
        setTools(Array.isArray(data.tools) ? data.tools : []);
      })
      .catch(() => {
        setGuides([]);
        setTools([]);
      })
      .finally(() => setLoading(false));
  }, [open, excludeId]);

  const filtreliRehber = useMemo(
    () => guides.filter((g) => matches(g.title, query)),
    [guides, query]
  );
  const filtreliArac = useMemo(
    () => tools.filter((t) => matches(t.title, query)),
    [tools, query]
  );

  function choose(target: Target, tur: "rehber" | "arac") {
    setPicked(target);
    setKicker(tur === "arac" ? KICKER_ARAC : KICKER_REHBER);
    if (!anchor.trim()) setAnchor(target.title);
  }

  function apply() {
    if (!picked || !anchor.trim()) return;
    onInsert({
      href: picked.path,
      anchor: anchor.trim(),
      kicker: kicker.trim() || KICKER_REHBER,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>İç link kutusu ekle</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            Paragrafların arasına yerleşen ayrı bir kutu. Yalnızca rehber ve hesaplama
            araçlarına bağlanır; haberler listelenmez.
          </p>

          <Input
            placeholder="Başlıkta ara"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="max-h-52 space-y-3 overflow-y-auto rounded-md border border-slate-200 bg-slate-50/60 p-2">
            {loading ? (
              <p className="px-1 py-4 text-center text-sm text-slate-500">Yükleniyor…</p>
            ) : (
              <>
                <Group
                  label="Blog / rehberler"
                  empty="Yayımlanmış rehber yok. İçerik tipi Rehber olan bir yazı yayımlayın."
                  items={filtreliRehber}
                  pickedId={picked?.id}
                  onChoose={(t) => choose(t, "rehber")}
                />
                <Group
                  label="Hesaplama araçları"
                  empty="Araç bulunamadı."
                  items={filtreliArac}
                  pickedId={picked?.id}
                  onChoose={(t) => choose(t, "arac")}
                />
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">Yönlendirme cümlesi</label>
            <Input
              value={kicker}
              onChange={(e) => setKicker(e.target.value)}
              placeholder={KICKER_REHBER}
              className="h-9"
            />
            <div className="flex flex-wrap gap-1">
              {KICKER_HAZIR.map((hazir) => (
                <button
                  key={hazir}
                  type="button"
                  onClick={() => setKicker(hazir)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    kicker === hazir
                      ? "border-slate-800 bg-slate-800 text-white"
                      : "border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {hazir}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600">
              Görünen metin (anchor)
            </label>
            <Input
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder="Emekli maaşı nasıl hesaplanır?"
              className="h-9"
            />
          </div>

          {picked ? (
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <p className="text-[13px] font-medium text-slate-500">
                {kicker || KICKER_REHBER}
              </p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">
                {anchor.trim() || picked.title}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-400">{picked.path}</p>
            </div>
          ) : null}

          <Button onClick={apply} className="w-full" disabled={!picked || !anchor.trim()}>
            Kutuyu ekle
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Group({
  label,
  empty,
  items,
  pickedId,
  onChoose,
}: {
  label: string;
  empty: string;
  items: Target[];
  pickedId?: string;
  onChoose: (item: Target) => void;
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
