"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CekilenHaber } from "@/lib/scrape";
import type { AiTaslak } from "@/lib/ai-revise";

export default function AdminCekPage() {
  const [cekiliyor, setCekiliyor] = useState(false);
  const [haberler, setHaberler] = useState<CekilenHaber[]>([]);
  const [mesaj, setMesaj] = useState("");
  const [gonderilen, setGonderilen] = useState<Set<string>>(new Set());
  const [kontrol, setKontrol] = useState<AiTaslak[]>([]);
  const [acikId, setAcikId] = useState<string | null>(null);

  const cek = async () => {
    setCekiliyor(true);
    setHaberler([]);
    setKontrol([]);
    setGonderilen(new Set());
    setMesaj("RSS ve gövdeler okunuyor… Bu 15–20 saniye sürebilir.");
    try {
      const res = await fetch("/api/admin/cek", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Çekilemedi.");
        setMesaj("");
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

  const aiyaGonder = async (haber: CekilenHaber) => {
    setGonderilen((prev) => new Set(prev).add(haber.id));
    try {
      const res = await fetch("/api/admin/ai-gonder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(haber),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Gönderilemedi.");
        setGonderilen((prev) => {
          const next = new Set(prev);
          next.delete(haber.id);
          return next;
        });
        return;
      }
      setKontrol((prev) => [data as AiTaslak, ...prev]);
      setHaberler((prev) => prev.filter((h) => h.id !== haber.id));
      toast.success(data.uyari ?? "Kontrole düştü.");
    } catch {
      toast.error("Gönderilemedi.");
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
            RSS + gövde taraması RAM’de durur, diske yazılmaz. Sayfayı yenilersen liste uçar.
          </p>
        </div>
        <Button onClick={cek} disabled={cekiliyor} className="h-10 px-5">
          {cekiliyor ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
          {cekiliyor ? "Haberler çekiliyor…" : "Haber Çek"}
        </Button>
      </div>

      {mesaj ? <p className="text-sm text-slate-500">{mesaj}</p> : null}

      {kontrol.length > 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-amber-900">
            Kontrol kuyruğu · {kontrol.length}
          </h2>
          <p className="mt-0.5 text-xs text-amber-800/80">
            AI katmanı sonra bağlanacak. Şimdilik ham metin taslak olarak burada.
          </p>
          <ul className="mt-3 space-y-3">
            {kontrol.map((k) => (
              <li key={k.haber.id} className="rounded-xl border border-amber-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  {k.haber.kaynak}
                </p>
                <p className="font-medium text-slate-800">{k.haber.baslik}</p>
                <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-slate-600">
                  {k.taslak}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {haberler.length === 0 && !cekiliyor ? (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
          Henüz tarama yok. Haber Çek’e bas.
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
                    onClick={() => aiyaGonder(h)}
                  >
                    {gonderilen.has(h.id) ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    AI’a gönder
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
    </div>
  );
}
