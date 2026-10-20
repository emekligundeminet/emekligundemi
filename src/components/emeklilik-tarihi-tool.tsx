"use client";

import { useState, type FormEvent } from "react";
import {
  CalcNotice,
  CalcResult,
  CalcSecim,
  CalcSoru,
  CalcSubmit,
  CalculatorShell,
  calcInputClass,
} from "@/components/calculator-shell";
import {
  emeklilikHesapla,
  tarihOku,
  type Cinsiyet,
  type EmeklilikSonucu,
  type Statu,
} from "@/lib/emeklilik-tarihi";

type Tempo = "360" | "180" | "0";

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function tarihGoster(iso: string) {
  const d = tarihOku(iso);
  return d ? TARIH.format(d) : iso;
}

/** "15031975" → "15.03.1975" */
function tarihMaske(girdi: string) {
  const r = girdi.replace(/\D/g, "").slice(0, 8);
  if (r.length <= 2) return r;
  if (r.length <= 4) return `${r.slice(0, 2)}.${r.slice(2)}`;
  return `${r.slice(0, 2)}.${r.slice(2, 4)}.${r.slice(4)}`;
}

/** "15.03.1975" → "1975-03-15" (geçersizse "") */
function isoYap(maskeli: string) {
  const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(maskeli);
  if (!m) return "";
  const iso = `${m[3]}-${m[2]}-${m[1]}`;
  return tarihOku(iso) ? iso : "";
}

function bugunIstanbul() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(new Date());
}

const DONEM_ETIKETI: Record<EmeklilikSonucu["donem"], string> = {
  eyt: "8 Eylül 1999 ve öncesi girişli (EYT kapsamı)",
  "4447": "8 Eylül 1999 – 30 Nisan 2008 arası girişli",
  "5510": "1 Mayıs 2008 ve sonrası girişli",
};

function TarihKutusu({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      id={id}
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(tarihMaske(e.target.value))}
      placeholder="GG.AA.YYYY"
      className={calcInputClass()}
    />
  );
}

/**
 * Ne zaman emekli olurum? Statü, cinsiyet, doğum ve ilk giriş tarihi ile
 * prim gününden yaşlılık aylığı şartlarını ve tahmini tarihi gösterir.
 * Kurallar lib/emeklilik-tarihi.ts içinde, mevzuat atıflarıyla.
 */
export function EmeklilikTarihiTool() {
  const [statu, setStatu] = useState<Statu | null>(null);
  const [cinsiyet, setCinsiyet] = useState<Cinsiyet | null>(null);
  const [dogum, setDogum] = useState("");
  const [giris, setGiris] = useState("");
  const [gunGirdi, setGunGirdi] = useState("");
  const [tempo, setTempo] = useState<Tempo | null>("360");
  const [sonuc, setSonuc] = useState<EmeklilikSonucu | null>(null);
  const [hata, setHata] = useState("");

  const dogumIso = isoYap(dogum);
  const girisIso = isoYap(giris);
  const gun = Number(gunGirdi.replace(/\D/g, "")) || 0;
  const hazir = statu != null && cinsiyet != null && !!dogumIso && !!girisIso && tempo != null;

  const sifirla = () => {
    setSonuc(null);
    setHata("");
  };

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!hazir) return;
    const r = emeklilikHesapla({
      statu,
      cinsiyet,
      dogum: dogumIso,
      giris: girisIso,
      primGun: gun,
      yillikGun: Number(tempo),
      bugun: bugunIstanbul(),
    });
    if (!r) {
      setHata("Tarihleri kontrol edin: işe giriş, doğumdan sonra ve bugünden önce olmalı.");
      setSonuc(null);
      return;
    }
    setHata("");
    setSonuc(r);
  }

  const bugun = bugunIstanbul();
  const enErken = sonuc?.enErken ?? null;
  const simdi = enErken?.tarih != null && enErken.tarih <= bugun;

  return (
    <CalculatorShell>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <CalcSoru no={1}>Hangi statüdesiniz?</CalcSoru>
          <CalcSecim<Statu>
            deger={statu}
            onChange={(v) => {
              setStatu(v);
              sifirla();
            }}
            secenekler={[
              { value: "4a", label: "SSK (4/a)", alt: "İşçi, özel sektör" },
              { value: "4b", label: "Bağ-Kur (4/b)", alt: "Esnaf, şirket ortağı, çiftçi" },
              { value: "4c", label: "Memur (4/c)", alt: "Emekli Sandığı" },
            ]}
          />
        </div>

        <div>
          <CalcSoru no={2}>Cinsiyetiniz</CalcSoru>
          <CalcSecim<Cinsiyet>
            deger={cinsiyet}
            onChange={(v) => {
              setCinsiyet(v);
              sifirla();
            }}
            secenekler={[
              { value: "kadin", label: "Kadın" },
              { value: "erkek", label: "Erkek" },
            ]}
          />
        </div>

        <div>
          <label htmlFor="emeklilik-dogum">
            <CalcSoru no={3}>Doğum tarihiniz</CalcSoru>
          </label>
          <TarihKutusu
            id="emeklilik-dogum"
            value={dogum}
            onChange={(v) => {
              setDogum(v);
              sifirla();
            }}
          />
        </div>

        <div>
          <label htmlFor="emeklilik-giris">
            <CalcSoru no={4}>İlk sigorta giriş tarihiniz</CalcSoru>
          </label>
          <TarihKutusu
            id="emeklilik-giris"
            value={giris}
            onChange={(v) => {
              setGiris(v);
              sifirla();
            }}
          />
          <p className="mt-2 text-[15px] text-neutral-600">
            Hangi statüde olursa olsun ilk kez sigortalı olduğunuz gün. e-Devlet&apos;te &quot;SGK Tescil ve Hizmet
            Dökümü&quot;nde yazar.
          </p>
        </div>

        <div>
          <label htmlFor="emeklilik-gun">
            <CalcSoru no={5}>Bugüne kadarki toplam prim gününüz</CalcSoru>
          </label>
          <div className="relative">
            <input
              id="emeklilik-gun"
              inputMode="numeric"
              autoComplete="off"
              value={gunGirdi}
              onChange={(e) => {
                setGunGirdi(e.target.value.replace(/\D/g, "").slice(0, 5).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                sifirla();
              }}
              placeholder="Örnek: 4.500"
              className={`${calcInputClass()} pr-16`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-bold text-neutral-500">
              gün
            </span>
          </div>
          <p className="mt-2 text-[15px] text-neutral-600">Yaklaşık 360 gün = 1 yıl. Borçlanma günleri dahil.</p>
        </div>

        <div>
          <CalcSoru no={6}>Bundan sonra prim ödemeye devam edecek misiniz?</CalcSoru>
          <CalcSecim<Tempo>
            deger={tempo}
            onChange={(v) => {
              setTempo(v);
              sifirla();
            }}
            secenekler={[
              { value: "360", label: "Evet, tam yıl", alt: "Yılda 360 gün" },
              { value: "180", label: "Yarım yıl", alt: "Yılda yaklaşık 180 gün" },
              { value: "0", label: "Hayır", alt: "Çalışmıyorum, prim ödemiyorum" },
            ]}
          />
        </div>

        <CalcSubmit disabled={!hazir}>Hesapla</CalcSubmit>
        {!hazir ? (
          <p className="text-center text-[15px] text-neutral-500">
            Önce soruları cevaplayın. Tarihleri gün.ay.yıl olarak yazın.
          </p>
        ) : null}
        {hata ? <CalcNotice>{hata}</CalcNotice> : null}
      </form>

      {sonuc ? (
        <CalcResult
          label={simdi ? "Emeklilik şartlarını sağlıyorsunuz" : "Tahmini en erken emeklilik tarihiniz"}
          value={enErken?.tarih ? (simdi ? "Bugün" : tarihGoster(enErken.tarih)) : "Hesaplanamadı"}
        >
          <p className="mt-3 text-[17px] leading-relaxed text-neutral-800">
            {DONEM_ETIKETI[sonuc.donem]}. {enErken ? <>En erken yol: <strong>{enErken.ad}</strong>.</> : null}
          </p>

          <div className="mt-4 space-y-4 border-t border-neutral-200 pt-4">
            {/* Normal yol her zaman; diğerleri yalnızca en erken olan (daha geç alternatif gürültü). */}
            {sonuc.yollar.filter((y, i) => i === 0 || !enErken || y === enErken).map((y) => (
              <div key={y.ad}>
                <p className="text-[16px] font-bold text-neutral-900">
                  {y.ad}
                  {y.tarih ? (
                    <span className="font-semibold text-neutral-600">
                      {" "}
                      — {y.tarih <= bugun ? "şartlar tamam" : tarihGoster(y.tarih)}
                    </span>
                  ) : null}
                </p>
                <ul className="mt-1.5 space-y-1 text-[15px] text-neutral-700">
                  {y.sartlar.map((s) => (
                    <li key={s.ad} className="flex gap-2">
                      <span aria-hidden className={s.tarih && s.tarih <= bugun ? "text-emerald-600" : "text-neutral-400"}>
                        {s.tarih && s.tarih <= bugun ? "✓" : "•"}
                      </span>
                      <span>
                        {s.ad}:{" "}
                        {s.tarih
                          ? s.tarih <= bugun
                            ? "sağlandı"
                            : tarihGoster(s.tarih)
                          : "prim ödemeye devam etmezseniz dolmaz"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {sonuc.uyarilar.length > 0 ? (
            <div className="mt-4 space-y-2">
              {sonuc.uyarilar.map((u) => (
                <CalcNotice key={u}>{u}</CalcNotice>
              ))}
            </div>
          ) : null}

          <ul className="mt-4 space-y-1.5 border-t border-neutral-200 pt-4 text-[15px] text-neutral-700">
            <li>
              Hangi statüden emekli olacağınız, son 7 yılda en çok prim ödediğiniz statüye göre belirlenir.
            </li>
            <li>
              Sonuç tahmindir. Kesin tarih için e-Devlet&apos;teki &quot;Normal Şartlarda Ne Zaman Emekli
              Olabilirim?&quot; hizmetine bakın.
            </li>
          </ul>
        </CalcResult>
      ) : null}
    </CalculatorShell>
  );
}
