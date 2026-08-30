"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  CalcNotice,
  CalcResult,
  CalcSubmit,
  CalculatorShell,
  calcInputClass,
} from "@/components/calculator-shell";
import { asMonthMap, formatTry, formatYuzde, hesaplaAlimGucu } from "@/lib/hesap-formulas";
import type { HesapParamMap } from "@/types/hesap";

const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

function parseTl(value: string) {
  return Number(value.replace(/\D/g, "")) || 0;
}

function sonAnahtar(map: Record<string, number>) {
  return Object.keys(map).sort().at(-1) ?? "";
}

export function AlimGucuTool({ params }: { params: HesapParamMap }) {
  const endeks = asMonthMap(params.tufe_endeks);
  const bugunKey = sonAnahtar(endeks);
  const yillar = [
    ...new Set(Object.keys(endeks).map((k) => Number(k.slice(0, 4))).filter((y) => y > 1900)),
  ].sort((a, b) => b - a);

  const [ay, setAy] = useState("1");
  const [yil, setYil] = useState(yillar[0] ? String(yillar[0]) : "");
  const [tutar, setTutar] = useState("");
  const [hesaplandi, setHesaplandi] = useState(false);

  const sonuc = useMemo(() => {
    const n = parseTl(tutar);
    if (!hesaplandi || n < 1 || !bugunKey) return null;
    const gecmisKey = `${yil}-${String(ay).padStart(2, "0")}`;
    const eGecis = endeks[gecmisKey];
    const eBugun = endeks[bugunKey];
    if (eGecis == null || eBugun == null) {
      return { eksik: gecmisKey } as const;
    }
    const r = hesaplaAlimGucu({ tutar: n, endeksGecis: eGecis, endeksBugun: eBugun });
    if (!r) return { eksik: gecmisKey } as const;
    return { ...r, tutar: n, gecmisKey, bugunKey };
  }, [ay, bugunKey, endeks, hesaplandi, tutar, yil]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setHesaplandi(true);
  }

  const paylasMetin =
    sonuc && "bugunkuKarsilik" in sonuc
      ? `${formatTry(sonuc.tutar)} (${sonuc.gecmisKey}) bugün ${formatTry(sonuc.bugunkuKarsilik)} eder. Alım gücü kaybı ${formatYuzde(sonuc.kayipYuzde)}.`
      : "";

  return (
    <CalculatorShell
      notice={
        Object.keys(endeks).length === 0 ? (
          <CalcNotice tone="neutral">
            TÜFE endeks serisi henüz yok. Hesaplama şu an kapalı.
          </CalcNotice>
        ) : (
          <CalcNotice>
            Hesap TÜİK endeksine dayanır. Sonuç ortalama fiyat düzeyidir; kişisel sepetiniz
            farklı olabilir.
          </CalcNotice>
        )
      }
    >
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div>
          <p className="mb-2 text-sm font-bold text-neutral-800">Geçmiş tarih</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">Ay</span>
              <select value={ay} onChange={(e) => setAy(e.target.value)} className={calcInputClass()}>
                {AYLAR.map((ad, i) => (
                  <option key={ad} value={i + 1}>
                    {ad}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">Yıl</span>
              <select value={yil} onChange={(e) => setYil(e.target.value)} className={calcInputClass()}>
                {(yillar.length ? yillar : [new Date().getFullYear()]).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-neutral-800">O günkü tutar / maaş</span>
          <input
            inputMode="decimal"
            value={tutar}
            onChange={(e) => setTutar(e.target.value)}
            placeholder="10000"
            className={calcInputClass()}
          />
        </label>

        <CalcSubmit>Hesapla</CalcSubmit>
      </form>

      {sonuc && "eksik" in sonuc ? (
        <p className="mt-4 text-sm text-[var(--brand)]">
          {sonuc.eksik} için endeks yok. Panele o ayı ekleyin.
        </p>
      ) : null}

      {sonuc && "bugunkuKarsilik" in sonuc ? (
        <CalcResult label="Bugünkü karşılık" value={formatTry(sonuc.bugunkuKarsilik)}>
          <p className="mt-3 text-[16px] font-bold leading-snug text-neutral-800">
            {formatTry(sonuc.tutar)} ({sonuc.gecmisKey}) bugün {formatTry(sonuc.bugunkuKarsilik)}{" "}
            eder. Alım gücü kaybı {formatYuzde(sonuc.kayipYuzde)}.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              className="inline-flex h-10 items-center bg-[#25D366] px-3 text-sm font-bold text-white"
              href={`https://wa.me/?text=${encodeURIComponent(paylasMetin)}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              WhatsApp
            </a>
            <a
              className="inline-flex h-10 items-center bg-neutral-900 px-3 text-sm font-bold text-white"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(paylasMetin)}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              X
            </a>
          </div>
        </CalcResult>
      ) : null}
    </CalculatorShell>
  );
}
