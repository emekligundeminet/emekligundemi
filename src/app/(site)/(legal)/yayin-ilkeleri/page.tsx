import { SitePage } from "@/components/site-page";
import { SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: staticDocumentTitle("Yayın İlkeleri") },
  description: "Emekliler.org haber ve rehber içeriklerini nasıl üretir.",
  alternates: { canonical: `${SITE_ORIGIN}/yayin-ilkeleri` },
  openGraph: { url: `${SITE_ORIGIN}/yayin-ilkeleri`, title: "Yayın İlkeleri" },
};

export default function YayinIlkeleriPage() {
  return (
    <SitePage title="Yayın İlkeleri">
      <p>
        Emeklilik ve sosyal güvenlik içeriği “Your Money or Your Life” kapsamındadır.
        Yanlış bir oran veya tarih okuyucuya maddi zarar verebilir. Bu yüzden
        aşağıdaki kurallar geçerlidir.
      </p>
      <ul className="list-disc space-y-2 pl-5">
        <li>Resmi oran veya tutar yoksa “açıklanmadı” yazılır; tahmin uydurulmaz.</li>
        <li>Ajans veya başka siteden alınan bilgi kaynak satırında belirtilir.</li>
        <li>Başlık, gövdede olmayan bir vaat içermez.</li>
        <li>Yapay zekâ taslak üretebilir; yayına alma kararı insandadır.</li>
        <li>İçerik değişmeden yalnızca tarihi güncellemek yapılmaz.</li>
        <li>Reklam ile haber metni birbirinden ayrılır.</li>
      </ul>
      <p>
        Hata görürseniz{" "}
        <a href="/duzeltme" className="text-[var(--brand)] underline">
          düzeltme
        </a>{" "}
        kanalından yazın.
      </p>
    </SitePage>
  );
}
