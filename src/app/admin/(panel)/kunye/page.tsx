"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KUNYE_FIELDS, type KunyeVeri } from "@/types/kunye";

const empty: KunyeVeri = Object.fromEntries(
  KUNYE_FIELDS.map((f) => [f.key, ""])
) as KunyeVeri;

export default function AdminKunyePage() {
  const [form, setForm] = useState<KunyeVeri>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/kunye")
      .then((r) => r.json())
      .then((data) => {
        if (data.message && !data.veri) throw new Error(data.message);
        setForm({ ...empty, ...(data.veri as KunyeVeri) });
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Künye yüklenemedi."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kunye", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.message ?? "Kaydedilemedi.");
        return;
      }
      setForm({ ...empty, ...(data.veri as KunyeVeri) });
      toast.success("Künye kaydedildi.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  return (
    <div className="max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800 sm:text-xl">Künye</h1>
        <p className="mt-1 text-sm text-slate-500">
          Boş bıraktığın satır sitede görünmez. Kayıt /kunye sayfasını yeniler.
        </p>
      </div>

      {KUNYE_FIELDS.map(({ key, label }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700" htmlFor={`kunye-${key}`}>
            {label}
          </label>
          <Input
            id={`kunye-${key}`}
            value={form[key] ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
          />
        </div>
      ))}

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </div>
  );
}
