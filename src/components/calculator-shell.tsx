import type { ReactNode } from "react";

export function calcInputClass() {
  return "h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-[15px] outline-none focus:border-neutral-900";
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
      ? "rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-[13px] leading-snug text-amber-950"
      : "rounded-md border border-neutral-300 bg-neutral-50 px-3 py-2.5 text-[13px] leading-snug text-neutral-800";
  return <p className={cls}>{children}</p>;
}

export function CalcSubmit({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-12 w-full cursor-pointer bg-[var(--brand)] text-base font-bold text-white hover:brightness-110"
    >
      {children}
    </button>
  );
}

export function CalcResult({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-5 border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-neutral-900">{value}</p>
      {children}
    </div>
  );
}

/** Mevcut emekli maaşı aracıyla aynı kart/input/sonuç iskeleti. */
export function CalculatorShell({
  notice,
  children,
}: {
  notice?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      {notice}
      {children}
    </div>
  );
}
