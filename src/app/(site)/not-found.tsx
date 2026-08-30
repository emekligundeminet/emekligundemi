import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-[#6d6258]">Bu adres artık yok veya hiç yayınlanmadı.</p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center bg-[var(--brand)] px-4 text-sm font-semibold text-white"
      >
        Ana sayfaya dön
      </Link>
    </div>
  );
}
