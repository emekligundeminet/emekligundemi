"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Kayit = { id: string; kelimeler: string; hedef: string; ekler: boolean; aktif: boolean };
type Hedef = { grup: string; ad: string; yol: string };

const yeniId = () => Math.random().toString(36).slice(2, 10);

export default function AdminIcLinklerPage() {
  const [kayitlar, setKayitlar] = useState<Kayit[]>([]);
  const [max, setMax] = useState(5);
  const [hedefler, setHedefler] = useState<Hedef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [degisti, setDegisti] = useState(false);

  useEffect(() => {
    fetch("/api/admin/ic-linkler")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.kayitlar)) setKayitlar(d.kayitlar);
        if (typeof d.max === "number") setMax(d.max);
        if (Array.isArray(d.hedefler)) setHedefler(d.hedefler);
      })
      .catch(() => toast.error("Kurallar getirilemedi."))
      .finally(() => setLoading(false));
  }, []);

  const hedefAdi = useMemo(() => new Map(hedefler.map((h) => [h.yol, `${h.grup}: ${h.ad}`])), [hedefler]);

  const guncelle = (i: number, patch: Partial<Kayit>) => {
    setKayitlar((k) => k.map((x, j) => (j === i ? { ...x, ...patch } : x)));
    setDegisti(true);
  };

  const kaydet = async () => {
    const eksik = kayitlar.findIndex((k) => !k.kelimeler.trim() || !k.hedef.trim().startsWith("/"));
    if (eksik >= 0) {
      toast.error(`${eksik + 1}. satırda kelime veya hedef eksik (hedef "/" ile başlamalı).`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/ic-linkler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kayitlar, max }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(d.message ?? "Kaydedilemedi.");
        return;
      }
      setKayitlar(d.kayitlar);
      setMax(d.max);
      setDegisti(false);
      toast.success("Kaydedildi. Sayfalar birkaç dakika içinde güncellenir.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">İç linkler</h1>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
          Haber ve rehber metinlerinde buradaki kelimeler geçince otomatik olarak seçtiğiniz sayfaya
          link verilir. Bir kelime sayfada kaç kez geçerse geçsin <strong>yalnızca ilk geçtiği yer</strong>{" "}
          linklenir. Aynı sayfaya tek link verilir; başlıklara ve sizin koyduğunuz linklere dokunulmaz.
          Birden fazla ifadeyi virgülle ayırın.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Yükleniyor…</p>
      ) : (
        <>
          <datalist id="ic-link-hedefler">
            {hedefler.map((h) => (
              <option key={h.yol} value={h.yol}>
                {h.grup}: {h.ad}
              </option>
            ))}
          </datalist>

          <div className="space-y-3">
            {kayitlar.map((k, i) => (
              <div
                key={k.id}
                className={`grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start ${k.aktif ? "border-slate-200" : "border-slate-100 bg-slate-50 opacity-70"}`}
              >
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Kelimeler</label>
                  <Input
                    value={k.kelimeler}
                    onChange={(e) => guncelle(i, { kelimeler: e.target.value })}
                    placeholder="emekli zammı, emekli zam oranı"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-500">Hedef sayfa</label>
                  <Input
                    value={k.hedef}
                    onChange={(e) => guncelle(i, { hedef: e.target.value })}
                    list="ic-link-hedefler"
                    placeholder="/araclar/… veya /blog/… (listeden seçin)"
                    className="h-9 font-mono text-xs"
                  />
                  <p className="truncate text-[11px] text-slate-400">
                    {hedefAdi.get(k.hedef) ?? (k.hedef ? "Listede yok; adresi kontrol edin." : "")}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:pt-5">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600" title="Açıkken 'ikramiyesi' yazınca 'ikramiyesini' de bağlanır">
                    <input type="checkbox" checked={k.ekler} onChange={(e) => guncelle(i, { ekler: e.target.checked })} />
                    Ekleri kapsa
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600">
                    <input type="checkbox" checked={k.aktif} onChange={(e) => guncelle(i, { aktif: e.target.checked })} />
                    Aktif
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setKayitlar((x) => x.filter((_, j) => j !== i));
                      setDegisti(true);
                    }}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50"
                    aria-label="Kuralı sil"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setKayitlar((x) => [...x, { id: yeniId(), kelimeler: "", hedef: "", ekler: true, aktif: true }]);
                setDegisti(true);
              }}
            >
              <Plus className="size-4" />
              Kural ekle
            </Button>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Sayfa başına en fazla
              <Input
                type="number"
                min={1}
                max={20}
                value={max}
                onChange={(e) => {
                  setMax(Number(e.target.value) || 1);
                  setDegisti(true);
                }}
                className="h-9 w-16 text-sm"
              />
              link
            </label>
            <Button type="button" onClick={kaydet} disabled={saving || !degisti} className="ml-auto">
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              Kaydet
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
