"use client";

import { useState, type FormEvent } from "react";
import {
  CalcNotice,
  CalcResult,
  CalcSoru,
  CalcSubmit,
  CalcTutar,
  CalculatorShell,
  calcInputClass,
} from "@/components/calculator-shell";
import { asMonthMap, formatTry, formatYuzde, hesaplaAlimGucu, parseTutar } from "@/lib/hesap-formulas";
import type { HesapParamMap } from "@/types/hesap";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

const anahtar = (yil: number, ay: number) => `${yil}-${String(ay).padStart(2, "0")}`;
const tarihYaz = (k: string) => `${AYLAR[Number(k.slice(5, 7)) - 1]} ${k.slice(0, 4)}`;

/** Parametre: tufe_endeks — TÜİK TÜFE endeksi { "2026-09": 137.23, … }. Baz yılı fark etmez (oran). */
export function AlimGucuTool({ params }: { params: HesapParamMap }) {
  const endeks = asMonthMap(params.tufe_endeks);
  const anahtarlar = Object.keys(endeks).sort();
  const bugunKey = anahtarlar.at(-1) ?? "";
  const yillar = [...new Set(anahtarlar.map((k) => Number(k.slice(0, 4))))].sort((a, b) => b - a);
  const varsayilanYil = bugunKey ? Number(bugunKey.slice(0, 4)) - 1 : 0;

  const [yil, setYil] = useState(String(yillar.includes(varsayilanYil) ? varsayilanYil : (yillar[0] ?? "")));
  const [ay, setAy] = useState(bugunKey ? String(Number(bugunKey.slice(5, 7))) : "1");
  const [tutar, setTutar] = useState("");
  const [goster, setGoster] = useState(false);

  const n = parseTutar(tutar);
  const gecmisKey = anahtar(Number(yil), Number(ay));
  const sonuc =
    endeks[gecmisKey] != null && bugunKey && n > 0
      ? hesaplaAlimGucu({ tutar: n, endeksGecis: endeks[gecmisKey]!, endeksBugun: endeks[bugunKey]! })
      : null;
  const aylarBuYil = AYLAR.map((ad, i) => ({ ad, no: i + 1 })).filter((m) => endeks[anahtar(Number(yil), m.no)] != null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (n > 0) setGoster(true);
  }

  if (anahtarlar.length === 0) {
    return <CalcNotice tone="neutral">Enflasyon verileri güncelleniyor. Lütfen daha sonra tekrar deneyin.</CalcNotice>;
  }

  const paylasMetin = sonuc
    ? `${tarihYaz(gecmisKey)} tarihindeki ${formatTry(n)}, bugün ${formatTry(sonuc.bugunkuKarsilik)} ediyor. Paranın değeri ${formatYuzde(sonuc.kayipYuzde, 0)} eridi. Hesapla: https://emekliler.org/araclar/alim-gucu-kaybi`
    : "";

  return (
    <CalculatorShell>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <CalcSoru no={1}>Hangi tarihteki parayı soruyorsunuz?</CalcSoru>
          <div className="grid grid-cols-2 gap-3">
            <select
              aria-label="Ay"
              value={ay}
              onChange={(e) => {
                setAy(e.target.value);
                setGoster(false);
              }}
              className={calcInputClass()}
            >
              {aylarBuYil.map((m) => (
                <option key={m.no} value={m.no}>
                  {m.ad}
                </option>
              ))}
            </select>
            <select
              aria-label="Yıl"
              value={yil}
              onChange={(e) => {
                const y = e.target.value;
                setYil(y);
                // Seçili ay o yılda yoksa (örn. içinde bulunulan yıl) son mevcut aya çek.
                if (endeks[anahtar(Number(y), Number(ay))] == null) {
                  const son = AYLAR.map((_, i) => i + 1).filter((m) => endeks[anahtar(Number(y), m)] != null).at(-1);
                  if (son) setAy(String(son));
                }
                setGoster(false);
              }}
              className={calcInputClass()}
            >
              {yillar.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="alim-tutar">
            <CalcSoru no={2}>O tarihteki tutar (maaşınız gibi)</CalcSoru>
          </label>
          <CalcTutar
            id="alim-tutar"
            value={tutar}
            onChange={(v) => {
              setTutar(v);
              setGoster(false);
            }}
            placeholder="Örnek: 10.000"
          />
        </div>

        <CalcSubmit disabled={n <= 0}>Hesapla</CalcSubmit>
      </form>

      {goster && sonuc ? (
        <CalcResult label={`${tarihYaz(gecmisKey)} tarihindeki ${formatTry(n)} bugün`} value={formatTry(sonuc.bugunkuKarsilik)}>
          <p className="mt-3 text-[17px] leading-relaxed text-neutral-800">
            Aynı şeyleri bugün almak için <strong>{formatTry(sonuc.bugunkuKarsilik)}</strong> gerekir. Yani
            paranın değeri <strong>{formatYuzde(sonuc.kayipYuzde, 0)}</strong> eridi.
          </p>
          <p className="mt-3 text-[14px] text-neutral-500">
            TÜİK enflasyonuna göre, {tarihYaz(bugunKey)} fiyatlarıyla. Kişisel harcamalarınız farklı olabilir.
          </p>
          <a
            className="mt-4 flex h-14 items-center justify-center rounded-lg bg-[#25D366] text-lg font-bold text-white"
            href={`https://wa.me/?text=${encodeURIComponent(paylasMetin)}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            WhatsApp&apos;ta paylaş
          </a>
        </CalcResult>
      ) : null}
    </CalculatorShell>
  );
}
