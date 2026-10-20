"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  CalcNotice,
  CalcResult,
  CalcSecim,
  CalcSoru,
  CalcSubmit,
  CalcTutar,
  CalculatorShell,
} from "@/components/calculator-shell";
import {
  asMonthMap,
  asNumber,
  asString,
  donemAylari,
  donemEnflasyonu,
  formatTry,
  formatYuzde,
  memurZamYuzde,
  parseTutar,
} from "@/lib/hesap-formulas";
import type { HesapParamMap } from "@/types/hesap";

type Tip = "ssk_bagkur" | "memur";

const AY_ADI = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const ayAdi = (k: string) => AY_ADI[Number(k.slice(5, 7)) - 1] ?? k;

/**
 * Parametreler (Panel → Hesap parametreleri):
 * - donem_baslangic: zam döneminin ilk ayı "2026-07" (Ocak 2027 zammı için)
 * - donem_etiketi: "Ocak 2027"
 * - tufe_endeks: TÜİK endeks serisi { "2026-07": 132.31, … } (asıl kaynak)
 * - tufe_aylik: endeks yoksa yedek aylık yüzdeler
 * - tufe_tahmin_aylik: açıklanmamış aylar için aylık tahmin; boşsa açıklananların ortalaması
 * - toplu_sozlesme_onceki / toplu_sozlesme_yeni: memur toplu sözleşme oranları (%)
 * - en_dusuk_emekli_ayligi: taban aylık (TL)
 */
export function ZamTool({ params }: { params: HesapParamMap }) {
  const donem = asString(params.donem_etiketi) || "Yeni dönem";
  const taban = asNumber(params.en_dusuk_emekli_ayligi) ?? 0;
  const tsOnceki = asNumber(params.toplu_sozlesme_onceki) ?? 0;
  const tsYeni = asNumber(params.toplu_sozlesme_yeni) ?? 0;

  const enf = useMemo(
    () =>
      donemEnflasyonu({
        aylar: donemAylari(asString(params.donem_baslangic)),
        endeks: asMonthMap(params.tufe_endeks),
        aylik: asMonthMap(params.tufe_aylik),
        tahminAylik: asNumber(params.tufe_tahmin_aylik),
      }),
    [params]
  );

  const [tip, setTip] = useState<Tip | null>(null);
  const [maas, setMaas] = useState("");
  const [goster, setGoster] = useState(false);

  const mevcut = parseTutar(maas);
  const oranYuzde = tip === "memur" ? memurZamYuzde(enf.toplamYuzde, tsOnceki, tsYeni) : enf.toplamYuzde;
  const kesinOran = tip === "memur" ? memurZamYuzde(enf.kesinlesenYuzde, tsOnceki, tsYeni) : enf.kesinlesenYuzde;
  const tabanda = taban > 0 && mevcut > 0 && mevcut <= taban + 1;
  const yeni = mevcut * (1 + oranYuzde / 100);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (tip && mevcut > 0) setGoster(true);
  }

  if (enf.aciklananAylar.length === 0) {
    return (
      <CalcNotice tone="neutral">
        Zam dönemi verileri güncelleniyor. Lütfen daha sonra tekrar deneyin.
      </CalcNotice>
    );
  }

  const kesinAylarMetni = `${ayAdi(enf.aciklananAylar[0]!)}–${ayAdi(enf.aciklananAylar.at(-1)!)}`;

  return (
    <CalculatorShell
      notice={
        enf.kesin ? null : (
          <CalcNotice>
            {donem} zammı henüz kesinleşmedi. {kesinAylarMetni} enflasyonu açıklandı; kalan{" "}
            {enf.tahminAylar.length} ay için tahmin kullanılır. Sonuç yaklaşıktır.
          </CalcNotice>
        )
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <CalcSoru no={1}>Hangi emeklisiniz?</CalcSoru>
          <CalcSecim<Tip>
            deger={tip}
            onChange={(v) => {
              setTip(v);
              setGoster(false);
            }}
            secenekler={[
              { value: "ssk_bagkur", label: "SSK veya Bağ-Kur", alt: "İşçi ve esnaf emeklileri" },
              { value: "memur", label: "Memur emeklisi", alt: "Emekli Sandığı" },
            ]}
          />
        </div>

        <div>
          <label htmlFor="zam-maas">
            <CalcSoru no={2}>Şu an aldığınız emekli aylığı</CalcSoru>
          </label>
          <CalcTutar
            id="zam-maas"
            value={maas}
            onChange={(v) => {
              setMaas(v);
              setGoster(false);
            }}
          />
          <p className="mt-2 text-[15px] text-neutral-600">
            e-Devlet&apos;te veya banka hesabınızda gördüğünüz tutar.
          </p>
        </div>

        <CalcSubmit disabled={!tip || mevcut <= 0}>Hesapla</CalcSubmit>
        {!tip || mevcut <= 0 ? (
          <p className="text-center text-[15px] text-neutral-500">Önce iki soruyu cevaplayın.</p>
        ) : null}
      </form>

      {goster && tip && mevcut > 0 ? (
        tabanda ? (
          <CalcResult label={`${donem} için`} value="En düşük aylık">
            <p className="mt-3 text-[17px] leading-relaxed text-neutral-800">
              Şu an en düşük emekli aylığını ({formatTry(taban)}) alıyorsunuz. Bu tutar zamla değil, ayrı
              bir yasal kararla belirlenir. Zam oranı kadar artırılırsa yaklaşık{" "}
              <strong>{formatTry(taban * (1 + oranYuzde / 100))}</strong> olur; kesin rakam Meclis
              kararıyla açıklanır.
            </p>
          </CalcResult>
        ) : (
          <CalcResult
            label={`${donem}'den itibaren ${enf.kesin ? "" : "yaklaşık "}aylığınız`}
            value={formatTry(yeni)}
          >
            <p className="mt-3 text-[17px] leading-relaxed text-neutral-800">
              Aylığınıza <strong>{formatTry(yeni - mevcut)}</strong> zam gelir (zam oranı{" "}
              <strong>{formatYuzde(oranYuzde)}</strong>).
            </p>
            {!enf.kesin ? (
              <ul className="mt-4 space-y-1.5 border-t border-neutral-200 pt-4 text-[15px] text-neutral-700">
                <li>
                  Şu ana kadar kesinleşen zam: <strong>{formatYuzde(kesinOran)}</strong> (
                  {kesinAylarMetni} enflasyonu) → {formatTry(mevcut * (1 + kesinOran / 100))}
                </li>
                <li>
                  Kalan {enf.tahminAylar.length} ay için aylık {formatYuzde(enf.tahminAylik)} enflasyon
                  varsayıldı.
                </li>
                {tip === "memur" ? (
                  <li>
                    Memur emeklisi zammı: enflasyon farkı + {formatYuzde(tsYeni, 0)} toplu sözleşme zammı.
                  </li>
                ) : null}
              </ul>
            ) : null}
            <p className="mt-4 text-[14px] leading-snug text-neutral-500">
              Kesin tutar SGK tarafından e-Devlet&apos;te ve banka hesabınızda gösterilir.
            </p>
          </CalcResult>
        )
      ) : null}
    </CalculatorShell>
  );
}
