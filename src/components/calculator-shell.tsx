"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { tutarYaz } from "@/lib/hesap-formulas";

/**
 * Hesaplama araçlarının ortak iskeleti. Hedef kitle yaşlı okur: büyük yazı,
 * büyük dokunma alanı, tek soru tek kutu, sonuç tek büyük rakam + tek cümle.
 */

export function calcInputClass() {
  return "h-14 w-full rounded-lg border-2 border-neutral-300 bg-white px-4 text-xl font-semibold text-neutral-900 outline-none focus:border-[var(--brand)]";
}

export function CalcNotice({
  children,
  tone = "amber",
}: {
  children: ReactNode;
  tone?: "amber" | "neutral";
}) {
  const cls =
    tone === "amber"
      ? "rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950"
      : "rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-3 text-[15px] leading-relaxed text-neutral-800";
  return <p className={cls}>{children}</p>;
}

/** Numaralı adım başlığı: "1. Hangi emeklisiniz?" */
export function CalcSoru({ no, children }: { no: number; children: ReactNode }) {
  return (
    <span className="mb-3 flex items-center gap-3 text-lg font-bold text-neutral-900">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-base text-white">
        {no}
      </span>
      {children}
    </span>
  );
}

/** Radyo yerine büyük seçim düğmeleri. */
export function CalcSecim<T extends string>({
  secenekler,
  deger,
  onChange,
}: {
  secenekler: { value: T; label: string; alt?: string }[];
  deger: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
      {secenekler.map((s) => {
        const secili = deger === s.value;
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={secili}
            onClick={() => onChange(s.value)}
            className={`min-h-16 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
              secili
                ? "border-[var(--brand)] bg-red-50"
                : "border-neutral-300 bg-white hover:border-neutral-500"
            }`}
          >
            <span className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  secili ? "border-[var(--brand)]" : "border-neutral-400"
                }`}
              >
                {secili ? <span className="h-3 w-3 rounded-full bg-[var(--brand)]" /> : null}
              </span>
              <span>
                <span className="block text-lg font-bold text-neutral-900">{s.label}</span>
                {s.alt ? <span className="block text-[15px] text-neutral-600">{s.alt}</span> : null}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** TL kutusu: yazarken 25.000 gibi binlik ayırır; sağda "TL" yazar. */
export function CalcTutar({
  value,
  onChange,
  placeholder = "Örnek: 25.000",
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(tutarYaz(e.target.value))}
        placeholder={placeholder}
        className={`${calcInputClass()} pr-14`}
      />
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xl font-bold text-neutral-500">
        TL
      </span>
    </div>
  );
}

export function CalcSubmit({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="h-14 w-full cursor-pointer rounded-lg bg-[var(--brand)] text-xl font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

/** Sonuç: üstte kısa etiket, ortada büyük rakam, altında sade açıklama. */
export function CalcResult({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: ReactNode;
}) {
  // Sonuç çoğu telefonda ekranın altında kalıyor; görünür alana kaydır.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [value]);
  return (
    <div
      ref={ref}
      className="mt-6 scroll-mt-24 rounded-lg border-2 border-[var(--brand)] bg-white p-5"
      role="status"
      aria-live="polite"
    >
      <p className="text-[17px] font-semibold text-neutral-700">{label}</p>
      <p className="mt-1 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">{value}</p>
      {children}
    </div>
  );
}

export function CalculatorShell({
  notice,
  children,
}: {
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      {notice}
      {children}
    </div>
  );
}
