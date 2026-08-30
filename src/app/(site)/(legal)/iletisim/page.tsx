import { SitePage } from "@/components/site-page";
import { ADS_EMAIL, CONTACT_EMAIL, PUBLISHER_NAME } from "@/lib/publisher";
import { SITE_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Emekliler.org iletişim ve hata bildirimi.",
  alternates: { canonical: `${SITE_ORIGIN}/iletisim` },
  openGraph: { url: `${SITE_ORIGIN}/iletisim`, title: "İletişim" },
};

export default function IletisimPage() {
  return (
    <SitePage title="İletişim">
      <p>
        Yayıncı: {PUBLISHER_NAME}. Görüş, haber ihbarı ve düzeltme taleplerinizi
        e-posta ile iletebilirsiniz.
      </p>
      <p>
        Genel:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand)] underline">
          {CONTACT_EMAIL}
        </a>
        <br />
        Reklam:{" "}
        <a href={`mailto:${ADS_EMAIL}`} className="text-[var(--brand)] underline">
          {ADS_EMAIL}
        </a>
      </p>
      <p>
        Haber hatası için konuyu “Düzeltme talebi” yapın, haber adresini ve
        doğru bilgiyi yazın. Süre ve ayrıntı:{" "}
        <a href="/duzeltme" className="text-[var(--brand)] underline">
          düzeltme politikası
        </a>
        .
      </p>
    </SitePage>
  );
}
