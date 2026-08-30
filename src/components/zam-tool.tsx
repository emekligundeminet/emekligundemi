"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  CalcResult,
  CalcSubmit,
  CalculatorShell,
  calcInputClass,
} from "@/components/calculator-shell";
import {
  asMonthMap,
  asNumber,
  asString,
  formatTry,
  formatYuzde,
  hesaplaZam,
  kumulatifTufe,
  type ZamTipi,
} from "@/lib/hesap-formulas";
import type { HesapParamMap } from "@/types/hesap";

const TURLER: { value: ZamTipi; label: string }[] = [
  { value: "ssk_bagkur", label: "SSK / Bağ-Kur" },
  { value: "memur", label: "Memur emeklisi" },
];

function parseTl(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

export function ZamTool({ params }: { params: HesapParamMap }) {
  const zamSsk = asNumber(params.zam_ssk_bagkur_donem) ?? 0;
  const zamMemur = asNumber(params.zam_memur_donem) ?? 0;
  const taban = asNumber(params.en_dusuk_emekli_ayligi) ?? 0;
  const donem = asString(params.donem_etiketi) || "Dönem";
  const resmiAylar = asMonthMap(params.tufe_aylik);

  const [sekme, setSekme] = useState<"resmi" | "senaryo">("resmi");
  const [maas, setMaas] = useState("");
  const [tip, setTip] = useState<ZamTipi>("ssk_bagkur");
  const [tahmin, setTahmin] = useState<Record<string, string>>({});
  const [hesaplandi, setHesaplandi] = useState(false);

  const senaryoAylar = useMemo(() => {
    const next = { ...resmiAylar };
    for (const [k, v] of Object.entries(tahmin)) {
      const n = Number(v.replace(",", "."));
      if (Number.isFinite(n)) next[k] = n;
    }
    return next;
  }, [resmiAylar, tahmin]);

  const sonuc = useMemo(() => {
    const mevcut = parseTl(maas);
    if (!hesaplandi || mevcut < 1) return null;
    if (sekme === "senaryo") {
      const oran = kumulatifTufe(senaryoAylar) * 100;
      return {
        ...hesaplaZam({
          mevcutMaas: mevcut,
          tip,
          zamSskBagkur: oran,
          zamMemur: oran,
          taban,
        }),
        projeksiyon: true,
      };
    }
    return {
      ...hesaplaZam({
        mevcutMaas: mevcut,
        tip,
        zamSskBagkur: zamSsk,
        zamMemur: zamMemur,
        taban,
      }),
      projeksiyon: false,
    };
  }, [hesaplandi, maas, sekme, senaryoAylar, taban, tip, zamMemur, zamSsk]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setHesaplandi(true);
  }

  const tahminAnahtarlar = Object.keys(resmiAylar).sort();

  return (
    <CalculatorShell>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setSekme("resmi");
            setHesaplandi(false);
          }}
          className={`h-10 flex-1 text-sm font-bold ${
            sekme === "resmi"
              ? "bg-neutral-900 text-white"
              : "border border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          Resmi oran
        </button>
        <button
          type="button"
          onClick={() => {
            setSekme("senaryo");
            setHesaplandi(false);
          }}
          className={`h-10 flex-1 text-sm font-bold ${
            sekme === "senaryo"
              ? "bg-neutral-900 text-white"
              : "border border-neutral-300 bg-white text-neutral-700"
          }`}
        >
          Senaryo (TÜFE)
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-neutral-800">Emekli tipi</legend>
          <div className="flex flex-col gap-2">
            {TURLER.map((item) => (
              <label key={item.value} className="flex cursor-pointer items-center gap-2.5 text-[15px]">
                <input
                  type="radio"
                  name="tip"
                  checked={tip === item.value}
                  onChange={() => setTip(item.value)}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-neutral-800">Şu anki emekli maaşı</span>
          <input
            inputMode="decimal"
            value={maas}
            onChange={(e) => setMaas(e.target.value)}
            placeholder="25000"
            className={calcInputClass()}
          />
        </label>

        {sekme === "senaryo" ? (
          <fieldset>
            <legend className="mb-1 text-sm font-bold text-neutral-800">Aylık TÜFE (%)</legend>
            <p className="mb-2 text-[12px] text-neutral-500">
              Açıklanan aylar dolu gelir. Açıklanmamış ay için tahmin yazın.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tahminAnahtarlar.map((k) => (
                <label key={k} className="block">
                  <span className="mb-1 block text-[12px] text-neutral-600">{k}</span>
                  <input
                    inputMode="decimal"
                    defaultValue={String(resmiAylar[k] ?? "")}
                    onChange={(e) => setTahmin((p) => ({ ...p, [k]: e.target.value }))}
                    className={calcInputClass()}
                  />
                </label>
              ))}
              <label className="block">
                <span className="mb-1 block text-[12px] text-neutral-600">Yeni ay (YYYY-AA)</span>
                <input
                  inputMode="decimal"
                  placeholder="1.5"
                  onChange={(e) => setTahmin((p) => ({ ...p, tahmin: e.target.value }))}
                  className={calcInputClass()}
                />
              </label>
            </div>
          </fieldset>
        ) : null}

        <CalcSubmit>Hesapla</CalcSubmit>
      </form>

      {sonuc ? (
        <CalcResult label={`${donem} tahmini aylık`} value={formatTry(sonuc.odenen)}>
          <ul className="mt-4 space-y-1.5 text-[14px] text-neutral-800">
            <li>Zam tutarı: {formatTry(sonuc.fark)}</li>
            <li>Uygulanan oran: {formatYuzde(sonuc.oranYuzde)}</li>
            {sonuc.tabanUygulandi ? (
              <li>En düşük aylık tabanı uygulandı ({formatTry(taban)}).</li>
            ) : null}
          </ul>
          {sonuc.projeksiyon ? (
            <p className="mt-3 text-[13px] leading-snug text-neutral-600">
              Resmi oran henüz açıklanmadı, bu bir projeksiyondur.
            </p>
          ) : null}
        </CalcResult>
      ) : null}
    </CalculatorShell>
  );
}
