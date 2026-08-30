"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { HesapParametre } from "@/types/hesap";
import type { Json } from "@/types/db";

const GRUPLAR = ["zam", "ikramiye", "enflasyon", "seo"] as const;

function isRecord(value: Json): value is { [k: string]: Json | undefined } {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function degerToText(value: Json): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value == null) return "";
  return JSON.stringify(value);
}

function parseDeger(raw: string, current: Json): Json {
  const t = raw.trim();
  if (isRecord(current) || (t.startsWith("{") && t.endsWith("}"))) {
    try {
      return JSON.parse(t) as Json;
    } catch {
      return current;
    }
  }
  if (t === "") return "";
  const n = Number(t.replace(",", "."));
  if (t !== "" && Number.isFinite(n) && /^-?\d+([.,]\d+)?$/.test(t)) return n;
  return t;
}

function ObjectEditor({
  value,
  onChange,
}: {
  value: Record<string, Json | undefined>;
  onChange: (next: Record<string, Json | undefined>) => void;
}) {
  const rows = Object.entries(value);
  return (
    <div className="space-y-2">
      {rows.map(([k, v], i) => (
        <div key={`${k}-${i}`} className="grid grid-cols-[8rem_1fr_auto] gap-2">
          <Input
            value={k}
            onChange={(e) => {
              const next = { ...value };
              delete next[k];
              next[e.target.value] = v;
              onChange(next);
            }}
          />
          <Input
            value={v == null ? "" : String(v)}
            onChange={(e) => onChange({ ...value, [k]: e.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              const next = { ...value };
              delete next[k];
              onChange(next);
            }}
          >
            Sil
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={() => onChange({ ...value, "": "" })}>
        Satır ekle
      </Button>
    </div>
  );
}

function Row({
  row,
  onSaved,
}: {
  row: HesapParametre;
  onSaved: () => void;
}) {
  const [etiket, setEtiket] = useState(row.etiket);
  const [deger, setDeger] = useState<Json>(row.deger);
  const [saving, setSaving] = useState(false);
  const objectMode = isRecord(row.deger);

  async function save() {
    setSaving(true);
    const clean = isRecord(deger)
      ? Object.fromEntries(
          Object.entries(deger)
            .filter(([k]) => k.trim())
            .map(([k, v]) => {
              const n = Number(String(v).replace(",", "."));
              return [k, Number.isFinite(n) && String(v).trim() !== "" ? n : v];
            })
        )
      : deger;
    const res = await fetch("/api/admin/parametreler", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, etiket, deger: clean }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      toast.error(data.message ?? "Kaydedilemedi.");
      return;
    }
    toast.success("Kaydedildi.");
    onSaved();
  }

  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-mono text-slate-400">{row.anahtar}</p>
      <Input value={etiket} onChange={(e) => setEtiket(e.target.value)} />
      {row.aciklama ? <p className="text-xs text-slate-500">{row.aciklama}</p> : null}
      {objectMode && isRecord(deger) ? (
        <ObjectEditor value={deger} onChange={setDeger} />
      ) : (
        <Input
          value={degerToText(deger)}
          onChange={(e) => setDeger(parseDeger(e.target.value, deger))}
        />
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-400">{row.birim ?? "—"}</span>
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Kayıt…" : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminParametrelerPage() {
  const [rows, setRows] = useState<HesapParametre[]>([]);
  const [loading, setLoading] = useState(true);
  const [anahtar, setAnahtar] = useState("");
  const [etiket, setEtiket] = useState("");
  const [grup, setGrup] = useState("zam");
  const [birim, setBirim] = useState("");
  const [deger, setDeger] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, HesapParametre[]>();
    for (const row of rows) {
      const list = map.get(row.grup) ?? [];
      list.push(row);
      map.set(row.grup, list);
    }
    return map;
  }, [rows]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/parametreler");
    const data = await res.json().catch(() => null);
    setLoading(false);
    if (!res.ok) {
      toast.error(data?.message ?? "Parametreler yüklenemedi.");
      setRows([]);
      return;
    }
    setRows(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!anahtar.trim() || !etiket.trim()) {
      toast.error("Anahtar ve etiket zorunlu.");
      return;
    }
    const parsed = parseDeger(deger, deger.trim().startsWith("{") ? {} : 0);
    const res = await fetch("/api/admin/parametreler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anahtar: anahtar.trim(),
        etiket: etiket.trim(),
        grup,
        birim: birim || null,
        deger: parsed,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.message ?? "Eklenemedi.");
      return;
    }
    toast.success("Parametre eklendi.");
    setAnahtar("");
    setEtiket("");
    setDeger("");
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Hesap parametreleri</h1>
        <p className="mt-1 text-sm text-slate-500">
          Zam, ikramiye ve TÜFE oranları burada. Kod değişmez; kaydetince araçlar yenilenir.
        </p>
      </div>

      {loading ? <p className="text-sm text-slate-500">Yükleniyor…</p> : null}

      {[...grouped.entries()].map(([g, list]) => (
        <section key={g} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{g}</h2>
          {list.map((row) => (
            <Row key={row.id} row={row} onSaved={load} />
          ))}
        </section>
      ))}

      <section className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4">
        <h2 className="text-sm font-semibold text-slate-700">Yeni parametre</h2>
        <Input placeholder="anahtar (zam_ssk_bagkur_donem)" value={anahtar} onChange={(e) => setAnahtar(e.target.value)} />
        <Input placeholder="etiket" value={etiket} onChange={(e) => setEtiket(e.target.value)} />
        <select
          value={grup}
          onChange={(e) => setGrup(e.target.value)}
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm"
        >
          {GRUPLAR.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <Input placeholder="birim (%, TL, tarih)" value={birim} onChange={(e) => setBirim(e.target.value)} />
        <Input placeholder="değer (sayı, metin veya JSON)" value={deger} onChange={(e) => setDeger(e.target.value)} />
        <Button type="button" onClick={create}>
          Ekle
        </Button>
      </section>
    </div>
  );
}
