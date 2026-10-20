"use client";

import { useState, type FormEvent } from "react";
import {
  CalcNotice,
  CalcResult,
  CalcSecim,
  CalcSoru,
  CalcSubmit,
  CalcTutar,
  CalculatorShell,
  calcInputClass,
} from "@/components/calculator-shell";
import { ABO_TAVAN, emekliAyligiTahmini, formatTry, formatYuzde, parseTutar } from "@/lib/hesap-formulas";

type Giris = "sonra" | "once";

/**
 * Emekli maaşı tahmini — yalnız Ekim 2008 sonrası (5510) formülü:
 * her 360 prim günü %2, en çok %90; taban = en düşük emekli aylığı.
 * 2008 öncesi girişlerde sonuç açıkça "yaklaşık" etiketlenir.
 */
export function PensionTool({ taban }: { taban: number }) {
  const [giris, setGiris] = useState<Giris | null>(null);
  const [gunGirdi, setGunGirdi] = useState("");
  const [kazanc, setKazanc] = useState("");
  const [goster, setGoster] = useState(false);

  const gun = Number(gunGirdi.replace(/\D/g, "")) || 0;
  const aylikKazanc = parseTutar(kazanc);
  const hazir = giris != null && gun > 0 && aylikKazanc > 0;
  const r = hazir ? emekliAyligiTahmini({ primGun: gun, aylikKazanc, taban }) : null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (hazir) setGoster(true);
  }

  const sifirla = () => setGoster(false);

  return (
    <CalculatorShell>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <CalcSoru no={1}>İlk kez ne zaman sigortalı oldunuz?</CalcSoru>
          <CalcSecim<Giris>
            deger={giris}
            onChange={(v) => {
              setGiris(v);
              sifirla();
            }}
            secenekler={[
              { value: "sonra", label: "Ekim 2008 veya sonra", alt: "İlk işe giriş 1 Ekim 2008 ve sonrası" },
              { value: "once", label: "Ekim 2008'den önce", alt: "Sonuç yaklaşık olur" },
            ]}
          />
        </div>

        <div>
          <label htmlFor="emekli-gun">
            <CalcSoru no={2}>Toplam prim gününüz</CalcSoru>
          </label>
          <div className="relative">
            <input
              id="emekli-gun"
              inputMode="numeric"
              autoComplete="off"
              value={gunGirdi}
              onChange={(e) => {
                setGunGirdi(e.target.value.replace(/\D/g, "").slice(0, 5).replace(/\B(?=(\d{3})+(?!\d))/g, "."));
                sifirla();
              }}
              placeholder="Örnek: 7.200"
              className={`${calcInputClass()} pr-16`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-bold text-neutral-500">
              gün
            </span>
          </div>
          <p className="mt-2 text-[15px] text-neutral-600">
            e-Devlet&apos;te &quot;SGK Tescil ve Hizmet Dökümü&quot;nde yazar. Yaklaşık 360 gün = 1 yıl.
          </p>
        </div>

        <div>
          <label htmlFor="emekli-kazanc">
            <CalcSoru no={3}>Ortalama aylık brüt kazancınız</CalcSoru>
          </label>
          <CalcTutar
            id="emekli-kazanc"
            value={kazanc}
            onChange={(v) => {
              setKazanc(v);
              sifirla();
            }}
            placeholder="Örnek: 45.000"
          />
          <p className="mt-2 text-[15px] text-neutral-600">
            Bordronuzdaki brüt maaş, bugünkü parayla. Çalışma hayatınızın ortalamasını bilmiyorsanız
            bugünkü brüt maaşınızı yazın.
          </p>
        </div>

        <CalcSubmit disabled={!hazir}>Hesapla</CalcSubmit>
        {!hazir ? (
          <p className="text-center text-[15px] text-neutral-500">Önce üç soruyu cevaplayın.</p>
        ) : null}
      </form>

      {goster && r ? (
        <CalcResult
          label={giris === "once" ? "Yaklaşık emekli aylığınız" : "Tahmini emekli aylığınız"}
          value={formatTry(r.aylik)}
        >
          {r.tabanda ? (
            <p className="mt-3 text-[17px] leading-relaxed text-neutral-800">
              Formülle çıkan tutar {formatTry(r.ham)}; bu en düşük emekli aylığının altında olduğu için size{" "}
              <strong>{formatTry(taban)}</strong> ödenir.
            </p>
          ) : (
            <p className="mt-3 text-[17px] leading-relaxed text-neutral-800">
              {gun.toLocaleString("tr-TR")} prim gününüz için aylık bağlama oranı{" "}
              <strong>{formatYuzde(r.aboYuzde)}</strong>: brüt kazancınızın bu kadarı emekli aylığı olur.
              {r.aboTavanda ? ` Oran en fazla %${ABO_TAVAN} olabilir.` : ""}
            </p>
          )}

          {giris === "once" ? (
            <div className="mt-4">
              <CalcNotice>
                İlk sigorta girişiniz Ekim 2008&apos;den önce olduğu için aylığınızın bir kısmı eski kurallarla
                (2000 öncesi ve 2000–2008 dönemleri) hesaplanır. Bu dönemlerin oranları farklıdır; gerçek
                aylığınız bu sonuçtan belirgin şekilde farklı olabilir. Sonucu yalnızca yaklaşık fikir için
                kullanın.
              </CalcNotice>
            </div>
          ) : null}

          <ul className="mt-4 space-y-1.5 border-t border-neutral-200 pt-4 text-[15px] text-neutral-700">
            <li>Emekli olabilmek için yaş ve prim günü şartlarını ayrıca sağlamanız gerekir.</li>
            <li>Kesin tutarı emeklilik başvurunuzdan sonra SGK hesaplar; e-Devlet&apos;te görünür.</li>
          </ul>
        </CalcResult>
      ) : null}
    </CalculatorShell>
  );
}
