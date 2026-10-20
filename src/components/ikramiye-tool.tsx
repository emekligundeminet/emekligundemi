"use client";

import { useEffect, useState } from "react";
import { CalcNotice, CalcResult, CalcSecim, CalcSoru, CalculatorShell } from "@/components/calculator-shell";
import { asNumber, asString, formatTry } from "@/lib/hesap-formulas";
import type { HesapParamMap } from "@/types/hesap";

type Kim = "kendi" | "hak_sahibi";

function gunKalan(iso: string) {
  const t = Date.parse(`${iso}T00:00:00+03:00`);
  if (!Number.isFinite(t)) return null;
  return Math.ceil((t - Date.now()) / 86400000);
}

function formatTarih(iso: string) {
  const t = Date.parse(`${iso}T12:00:00+03:00`);
  if (!Number.isFinite(t)) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(t));
}

const HISSELER = [100, 75, 50, 25] as const;

/**
 * Bayram ikramiyesi: emekliye tam tutar; dul/yetim aylığı alanlara hisseleri
 * oranında ödenir. Parametreler: bayram_ikramiyesi_tutar, sonraki_bayram_tarihi,
 * ikramiye_odeme_tarihi (YYYY-AA-GG).
 */
export function IkramiyeTool({ params }: { params: HesapParamMap }) {
  const tutar = asNumber(params.bayram_ikramiyesi_tutar);
  const bayram = asString(params.sonraki_bayram_tarihi).trim();
  const odeme = asString(params.ikramiye_odeme_tarihi).trim();
  const [kalan, setKalan] = useState<number | null>(null);
  const [kim, setKim] = useState<Kim | null>(null);
  const [hisse, setHisse] = useState<number | null>(null);

  useEffect(() => {
    if (!bayram) return;
    const tick = () => setKalan(gunKalan(bayram));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [bayram]);

  if (tutar == null) {
    return (
      <CalcNotice tone="neutral">İkramiye tutarı güncelleniyor. Lütfen daha sonra tekrar deneyin.</CalcNotice>
    );
  }

  const oran = kim === "kendi" ? 100 : hisse;
  const alinacak = oran != null ? (tutar * oran) / 100 : null;

  return (
    <CalculatorShell>
      <div>
        <CalcSoru no={1}>Hangi aylığı alıyorsunuz?</CalcSoru>
        <CalcSecim<Kim>
          deger={kim}
          onChange={(v) => {
            setKim(v);
            setHisse(null);
          }}
          secenekler={[
            { value: "kendi", label: "Kendi emekli aylığım", alt: "SSK, Bağ-Kur veya Emekli Sandığı" },
            { value: "hak_sahibi", label: "Dul veya yetim aylığı", alt: "Eşimden, annemden veya babamdan" },
          ]}
        />
      </div>

      {kim === "hak_sahibi" ? (
        <div>
          <CalcSoru no={2}>Aylıktaki hisse oranınız</CalcSoru>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {HISSELER.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHisse(h)}
                aria-pressed={hisse === h}
                className={`h-14 rounded-lg border-2 text-xl font-bold ${
                  hisse === h
                    ? "border-[var(--brand)] bg-red-50 text-neutral-900"
                    : "border-neutral-300 bg-white text-neutral-700"
                }`}
              >
                %{h}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[15px] text-neutral-600">
            Hisse oranınız e-Devlet&apos;teki aylık bilgilerinizde yazar.
          </p>
        </div>
      ) : null}

      {alinacak != null ? (
        <CalcResult label="Size ödenecek bayram ikramiyesi" value={formatTry(alinacak)}>
          {oran !== 100 ? (
            <p className="mt-3 text-[17px] text-neutral-800">
              Tam ikramiye {formatTry(tutar)}; hisseniz %{oran} olduğu için {formatTry(alinacak)} ödenir.
            </p>
          ) : null}
          <ul className="mt-4 space-y-1.5 text-[17px] text-neutral-800">
            {bayram ? <li>Bayram: {formatTarih(bayram)}</li> : null}
            {kalan != null && kalan > 0 ? (
              <li>
                Bayrama <strong>{kalan} gün</strong> kaldı.
              </li>
            ) : null}
            {odeme ? <li>Hesaba yatış: {formatTarih(odeme)}</li> : null}
          </ul>
          <p className="mt-4 text-[14px] text-neutral-500">
            İkramiye, emekli aylığınızın yattığı hesaba ayrıca yatar. Kesin tutar e-Devlet&apos;te görünür.
          </p>
        </CalcResult>
      ) : null}
    </CalculatorShell>
  );
}
