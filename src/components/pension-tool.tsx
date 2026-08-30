"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalcNotice, CalcResult, CalcSubmit, calcInputClass } from "@/components/calculator-shell";
import { isPensionDataReady } from "@/lib/pension-data";
import { dagitPrimGunleri, estimatePension, type SigortaTuru } from "@/lib/pension-estimate";

const YIL_MIN = 1965;
const YIL_MAX = new Date().getFullYear();
const YILLAR = Array.from({ length: YIL_MAX - YIL_MIN + 1 }, (_, i) => YIL_MAX - i);
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

const TURLER: { value: SigortaTuru; label: string }[] = [
  { value: "ssk", label: "SSK (4A)" },
  { value: "bagkur", label: "Bağ-Kur (4B)" },
  { value: "memur", label: "Memur / Emekli Sandığı (4C)" },
];

const YMYL =
  "Bu araç tahmini sonuç verir. Kesin emekli maaşınız SGK/e-Devlet hesabınızda görünür. Hesaplama, kamuya açık SGK formülüne dayanır; kişisel durumunuza göre farklılık gösterebilir.";

function parseSayi(value: string) {
  return Number(value.replace(/\D/g, ""));
}

function formatTl(n: number) {
  return n.toLocaleString("tr-TR");
}


/** Client-only; form sunucuya gitmez. Katsayı yoksa tutar yok. */
export function PensionTool() {
  const [ay, setAy] = useState("1");
  const [yil, setYil] = useState("2000");
  const [gun, setGun] = useState("");
  const [d1, setD1] = useState("");
  const [d2, setD2] = useState("");
  const [d3, setD3] = useState("");
  const [donemElle, setDonemElle] = useState(false);
  const [kazanc, setKazanc] = useState("");
  const [kazancYili, setKazancYili] = useState("");
  const [kazanc1, setKazanc1] = useState("");
  const [kazanc2, setKazanc2] = useState("");
  const [kazanc3, setKazanc3] = useState("");
  const [tur, setTur] = useState<SigortaTuru>("ssk");
  const [hata, setHata] = useState("");
  const [hesaplandi, setHesaplandi] = useState(false);

  const toplam = parseSayi(gun);

  useEffect(() => {
    if (donemElle || toplam < 1) return;
    const dagitim = dagitPrimGunleri(Number(yil), Number(ay), toplam);
    setD1(String(dagitim.d1));
    setD2(String(dagitim.d2));
    setD3(String(dagitim.d3));
  }, [ay, yil, toplam, donemElle]);

  const sonuc = useMemo(() => {
    if (!hesaplandi) return null;
    return estimatePension({
      startYear: Number(yil),
      startMonth: Number(ay),
      primGun: toplam,
      donemGunleri: {
        d1: parseSayi(d1),
        d2: parseSayi(d2),
        d3: parseSayi(d3),
      },
      ortalamaKazanc: parseSayi(kazanc),
      kazancYili: kazancYili ? Number(kazancYili) : undefined,
      kazanc1: parseSayi(kazanc1) || undefined,
      kazanc2: parseSayi(kazanc2) || undefined,
      kazanc3: parseSayi(kazanc3) || undefined,
      tur,
    });
  }, [hesaplandi, yil, ay, toplam, d1, d2, d3, kazanc, kazancYili, kazanc1, kazanc2, kazanc3, tur]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (toplam < 360 || parseSayi(kazanc) < 1) {
      setHesaplandi(false);
      setHata("Prim günü (en az 360) ve ortalama kazancı girin.");
      return;
    }
    setHata("");
    setHesaplandi(true);
  }

  return (
    <div>
      <CalcNotice>{YMYL}</CalcNotice>
      {!isPensionDataReady() ? (
        <div className="mt-3">
          <CalcNotice tone="neutral">
            Veri güncelleniyor: güncelleme katsayıları ve alt sınır aylığı henüz girilmedi. Bu
            yüzden tahmini tutar gösterilmez.
          </CalcNotice>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm font-bold text-neutral-800">Sigortalılık türü</legend>
          <div className="flex flex-col gap-2">
            {TURLER.map((item) => (
              <label key={item.value} className="flex cursor-pointer items-center gap-2.5 text-[15px]">
                <input
                  type="radio"
                  name="tur"
                  value={item.value}
                  checked={tur === item.value}
                  onChange={() => setTur(item.value)}
                  className="h-4 w-4 accent-[var(--brand)]"
                />
                {item.label}
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-neutral-500">
            SSK / Bağ-Kur / memur farkı, resmi çarpan girilince uygulanır; şu an çarpan yok.
          </p>
        </fieldset>

        <div>
          <p className="mb-2 text-sm font-bold text-neutral-800">Sigorta başlangıç tarihi</p>
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
                {YILLAR.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-neutral-800">Toplam prim gün sayısı</span>
          <input
            inputMode="numeric"
            value={gun}
            onChange={(e) => setGun(e.target.value)}
            placeholder="7200"
            className={calcInputClass()}
          />
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-bold text-neutral-800">Dönem prim günü</legend>
          <p className="mb-2 text-[12px] text-neutral-500">
            Başlangıç tarihine göre taslak dağılır (kesintisiz çalışma varsayımı). SGK dökümünüz
            varsa düzeltin — dönem günü, takvim tahmininden daha doğrudur.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">2000 öncesi</span>
              <input
                inputMode="numeric"
                value={d1}
                onChange={(e) => {
                  setDonemElle(true);
                  setD1(e.target.value);
                }}
                className={calcInputClass()}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">2000–2008</span>
              <input
                inputMode="numeric"
                value={d2}
                onChange={(e) => {
                  setDonemElle(true);
                  setD2(e.target.value);
                }}
                className={calcInputClass()}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">2008 sonrası</span>
              <input
                inputMode="numeric"
                value={d3}
                onChange={(e) => {
                  setDonemElle(true);
                  setD3(e.target.value);
                }}
                className={calcInputClass()}
              />
            </label>
          </div>
          <button
            type="button"
            className="mt-2 text-[13px] font-semibold text-[var(--brand)] underline"
            onClick={() => {
              setDonemElle(false);
              const dagitim = dagitPrimGunleri(Number(yil), Number(ay), toplam);
              setD1(String(dagitim.d1));
              setD2(String(dagitim.d2));
              setD3(String(dagitim.d3));
            }}
          >
            Başlangıç tarihine göre yeniden dağıt
          </button>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-neutral-800">Ortalama aylık kazanç / son brüt</span>
          <input
            inputMode="numeric"
            value={kazanc}
            onChange={(e) => setKazanc(e.target.value)}
            placeholder="40000"
            className={calcInputClass()}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-bold text-neutral-800">Kazancın yılı (isteğe bağlı)</span>
          <select value={kazancYili} onChange={(e) => setKazancYili(e.target.value)} className={calcInputClass()}>
            <option value="">Bugünün TL — güncelleme yok</option>
            {YILLAR.map((y) => (
              <option key={y} value={y}>
                {y} (nominal; katsayıyla bugüne taşınır)
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="mb-1 text-sm font-bold text-neutral-800">Dönem kazancı (isteğe bağlı)</legend>
          <p className="mb-2 text-[12px] text-neutral-500">Boş bırakılırsa yukarıdaki ortalama kullanılır.</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">2000 öncesi</span>
              <input inputMode="numeric" value={kazanc1} onChange={(e) => setKazanc1(e.target.value)} className={calcInputClass()} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">2000–2008</span>
              <input inputMode="numeric" value={kazanc2} onChange={(e) => setKazanc2(e.target.value)} className={calcInputClass()} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-neutral-600">2008 sonrası</span>
              <input inputMode="numeric" value={kazanc3} onChange={(e) => setKazanc3(e.target.value)} className={calcInputClass()} />
            </label>
          </div>
        </fieldset>

        {hata ? <p className="text-sm text-[var(--brand)]">{hata}</p> : null}

        <CalcSubmit>Hesapla</CalcSubmit>
      </form>

      {sonuc?.ok === false && sonuc.kod === "veri" ? (
        <div className="mt-5 border border-neutral-300 bg-neutral-50 p-4">
          <p className="text-sm font-bold text-neutral-900">Veri güncelleniyor</p>
          <p className="mt-2 text-[13px] leading-snug text-neutral-700">{YMYL}</p>
          <p className="mt-2 text-[13px] text-neutral-600">
            Katsayı tabloları eksik olduğu için tahmini tutar gösterilmiyor. Yanlış kesin rakam
            üretilmez.
          </p>
        </div>
      ) : null}

      {sonuc?.ok === false && sonuc.kod === "girdi" ? (
        <p className="mt-4 text-sm text-[var(--brand)]">{sonuc.mesaj}</p>
      ) : null}

      {sonuc?.ok === true ? (
        <CalcResult label="Tahmini emekli maaşı" value={`${formatTl(sonuc.aylik)} TL`}>
          <p className="mt-2 text-[13px] leading-snug text-neutral-600">{YMYL}</p>
          <ul className="mt-4 space-y-1.5 text-[14px] text-neutral-800">
            <li>
              2000 öncesi: {sonuc.donem1.gun} gün
              {sonuc.donem1.aboYuzde != null ? ` · ABO %${sonuc.donem1.aboYuzde}` : ""}
            </li>
            <li>
              2000–2008: {sonuc.donem2.gun} gün
              {sonuc.donem2.aboYuzde != null ? ` · ABO %${sonuc.donem2.aboYuzde}` : ""}
            </li>
            <li>
              2008 sonrası: {sonuc.donem3.gun} gün
              {sonuc.donem3.aboYuzde != null ? ` · ABO %${sonuc.donem3.aboYuzde}` : ""}
            </li>
            {sonuc.altSiniraCekildi ? <li>Sonuç alt sınır aylığına çekildi.</li> : null}
          </ul>
        </CalcResult>
      ) : null}
    </div>
  );
}
