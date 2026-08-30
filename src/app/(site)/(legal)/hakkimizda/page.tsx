import { SitePage } from "@/components/site-page";
import { getSiteMeta } from "@/lib/site-meta";
import { CONTACT_EMAIL, PUBLISHER_NAME } from "@/lib/publisher";
import { SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: staticDocumentTitle("Hakkımızda") },
  description: "Emekliler.org ne işe yarar, kim yayınlar.",
  alternates: { canonical: `${SITE_ORIGIN}/hakkimizda` },
  openGraph: { url: `${SITE_ORIGIN}/hakkimizda`, title: "Hakkımızda" },
};

export default async function HakkimizdaPage() {
  const site = await getSiteMeta();
  const name = site?.name ?? "Emekliler";
  return (
    <SitePage title="Hakkımızda">
      <p>
        {name}, emeklilerin maaş, zam, ikramiye, SGK işlemleri ve günlük yaşamına
        dair haberi sade dilde toplayan bir sitedir. Amacımız resmi duyuruyu
        beklerken okuyucunun “ne değişti, bana nasıl yansır?” sorusuna cevap
        vermektir.
      </p>
      <p>
        Siteyi {PUBLISHER_NAME} yayınlar. Haberler insan onayı olmadan yayına
        çıkmaz. Hesap araçlarındaki oran ve tutarlar yönetim panelinden girilen
        resmi veya açıklanmış verilere dayanır; veri yoksa uydurma tutar
        üretilmez.
      </p>
      <p>
        Görüş ve haber ihbarı:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand)] underline">
          {CONTACT_EMAIL}
        </a>
      </p>
    </SitePage>
  );
}
