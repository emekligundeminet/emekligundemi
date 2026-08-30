import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Sayfa bulunamadı | Emekliler.org" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center text-slate-600">
      Sayfa bulunamadı.
    </div>
  );
}
