import { SitePage } from "@/components/site-page";
import { CONTACT_EMAIL, HOSTING_NOTE, PUBLISHER_NAME } from "@/lib/publisher";
import { SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: staticDocumentTitle("Aydınlatma Metni") },
  description: "KVKK madde 10 aydınlatma metni.",
  alternates: { canonical: `${SITE_ORIGIN}/aydinlatma-metni` },
  openGraph: { url: `${SITE_ORIGIN}/aydinlatma-metni`, title: "Aydınlatma Metni" },
};

export default function AydinlatmaPage() {
  return (
    <SitePage title="Aydınlatma Metni">
      <p>
        6698 sayılı Kanun’un 10. maddesi gereği veri sorumlusu sizi kişisel
        verilerinizin işlenmesi hakkında bilgilendirir.
      </p>
      <h2 className="pt-2 text-lg font-bold text-neutral-900">Veri sorumlusu</h2>
      <p>
        {PUBLISHER_NAME}, emekliler.org yayıncısı. İletişim:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand)] underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <h2 className="pt-2 text-lg font-bold text-neutral-900">İşlenen veriler ve amaç</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Site kullanımı:</strong> IP, tarayıcı, sayfa adresi — güvenliğin
          sağlanması ve hata ayıklama (meşru menfaat).
        </li>
        <li>
          <strong>Çerez tercihleri:</strong> onay veya ret kaydı — yasal
          yükümlülük ve tercihlerinizin hatırlanması.
        </li>
        <li>
          <strong>İletişim / düzeltme talebi:</strong> ad, e-posta, mesaj —
          talebinizi yanıtlamak (sözleşmenin kurulması veya meşru menfaat).
        </li>
        <li>
          <strong>Ölçüm ve reklam (yalnızca onay):</strong> Google Analytics ve
          Google AdSense çerezleri — istatistik ve reklam gösterimi (açık rıza).
        </li>
      </ul>
      <h2 className="pt-2 text-lg font-bold text-neutral-900">Aktarım</h2>
      <p>
        {HOSTING_NOTE} Onay verirseniz Google LLC (ABD) ölçüm ve reklam için
        veri işleyebilir. Standart sözleşme hükümleri ve Google’ın kendi
        politikaları geçerlidir.
      </p>
      <h2 className="pt-2 text-lg font-bold text-neutral-900">Saklama</h2>
      <p>
        İletişim kayıtları talebin sonuçlanmasından sonra en fazla 2 yıl;
        çerez tercihi 180 gün; sunucu günlükleri güvenlik amacıyla kısa süre
        tutulur. Onayladığınız üçüncü taraf çerezlerinin süresi ilgili
        sağlayıcının politikasına bağlıdır.
      </p>
      <h2 className="pt-2 text-lg font-bold text-neutral-900">Haklarınız</h2>
      <p>
        KVKK madde 11 haklarınızı {CONTACT_EMAIL} adresine yazarak
        kullanabilirsiniz. Ayrıntı için{" "}
        <a href="/kvkk" className="text-[var(--brand)] underline">
          KVKK
        </a>{" "}
        sayfasına bakın.
      </p>
    </SitePage>
  );
}
