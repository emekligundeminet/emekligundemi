"use client";

import { useEffect, useState } from "react";
import { CalcNotice, CalcResult, CalculatorShell } from "@/components/calculator-shell";
import { asNumber, asString, formatTry } from "@/lib/hesap-formulas";
import type { HesapParamMap } from "@/types/hesap";

function gunKalan(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const ms = t - Date.now();
  return Math.ceil(ms / 86400000);
}

function formatTarih(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(t));
}

export function IkramiyeTool({ params }: { params: HesapParamMap }) {
  const tutar = asNumber(params.bayram_ikramiyesi_tutar);
  const bayram = asString(params.sonraki_bayram_tarihi).trim();
  const odeme = asString(params.ikramiye_odeme_tarihi).trim();
  const [kalan, setKalan] = useState<number | null>(() => (bayram ? gunKalan(bayram) : null));

  useEffect(() => {
    if (!bayram) return;
    const tick = () => setKalan(gunKalan(bayram));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [bayram]);

  return (
    <CalculatorShell
      notice={
        <CalcNotice>
          Dul ve yetim aylığında hisse oranınız kadar ödeme yapılır; ekrandaki tutar tam hisse
          varsayar.
        </CalcNotice>
      }
    >
      {tutar == null ? (
        <p className="mt-5 text-sm text-[var(--brand)]">İkramiye tutarı henüz girilmedi.</p>
      ) : (
        <CalcResult label="Bayram ikramiyesi" value={formatTry(tutar)}>
          <ul className="mt-4 space-y-1.5 text-[14px] text-neutral-800">
            {bayram ? <li>Sonraki bayram: {formatTarih(bayram)}</li> : null}
            {kalan != null ? (
              <li>
                {kalan > 0
                  ? `${kalan} gün kaldı`
                  : kalan === 0
                    ? "Bayram bugün"
                    : "Bayram tarihi geçti"}
              </li>
            ) : null}
            {odeme ? <li>Ödeme tarihi: {formatTarih(odeme)}</li> : null}
          </ul>
          <p className="mt-3 text-[13px] leading-snug text-neutral-600">
            Dul/yetim: ikramiye genellikle bağlanan hisse oranında ödenir. Kesin tutar e-Devlet
            ve banka hesabınızda görünür.
          </p>
        </CalcResult>
      )}
    </CalculatorShell>
  );
}
