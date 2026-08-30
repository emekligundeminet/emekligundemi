import { SitePage } from "@/components/site-page";
import { ADS_EMAIL } from "@/lib/publisher";
import { SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: staticDocumentTitle("Reklam") },
  description: "Reklam ve iş birliği, editoryal bağımsızlık.",
  alternates: { canonical: `${SITE_ORIGIN}/reklam` },
  openGraph: { url: `${SITE_ORIGIN}/reklam`, title: "Reklam" },
};

export default function ReklamPage() {
  return (
    <SitePage title="Reklam ve iş birliği">
      <p>
        Reklam, sponsorluk veya iş birliği talepleriniz için{" "}
        <a href={`mailto:${ADS_EMAIL}`} className="text-[var(--brand)] underline">
          {ADS_EMAIL}
        </a>{" "}
        adresine yazın.
      </p>
      <p>
        Haberi kim yazdıysa reklamı o satmaz: editoryal metin ile reklam alanı
        ayrıdır. Sponsorlu içerik yayınlanırsa “reklam” veya “iş birliği”
        etiketi konur. Reklam veren, haberin başlığını veya sonucunu satın
        alamaz.
      </p>
      <p>
        Sitede Google AdSense kullanılabilir. Reklam çerezleri yalnızca çerez
        bandından onaylandıktan sonra yüklenir.
      </p>
    </SitePage>
  );
}
