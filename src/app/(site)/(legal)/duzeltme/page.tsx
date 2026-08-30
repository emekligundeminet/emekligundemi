import { SitePage } from "@/components/site-page";
import { CONTACT_EMAIL, CORRECTION_SLA } from "@/lib/publisher";
import { SITE_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Düzeltme ve Yanıt Hakkı",
  description: "Haber hatası ve düzeltme talebi nasıl iletilir.",
  alternates: { canonical: `${SITE_ORIGIN}/duzeltme` },
  openGraph: { url: `${SITE_ORIGIN}/duzeltme`, title: "Düzeltme ve Yanıt Hakkı" },
};

export default function DuzeltmePage() {
  return (
    <SitePage title="Düzeltme ve Yanıt Hakkı">
      <p>
        Yanlış rakam, tarih, isim veya bağlam görürseniz bize yazın. Talebinizi
        en geç {CORRECTION_SLA} içinde inceleriz. Düzeltme yapılırsa haberde
        güncellenme tarihi görünür; içerik değişmeden tarih oynatılmaz.
      </p>
      <p>E-postada şunları belirtin:</p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Haberin adresi (URL)</li>
        <li>Hangi cümlenin veya rakamın hatalı olduğu</li>
        <li>Doğru bilgi ve mümkünse resmi kaynak</li>
        <li>Yanıt hakkı talebiyse adınız ve temsil ettiğiniz kurum</li>
      </ul>
      <p>
        Adres:{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=Duzeltme%20talebi`}
          className="text-[var(--brand)] underline"
        >
          {CONTACT_EMAIL}
        </a>
        . Haber sayfasındaki “Hata bildir” bağlantısı aynı adrese gider.
      </p>
    </SitePage>
  );
}
