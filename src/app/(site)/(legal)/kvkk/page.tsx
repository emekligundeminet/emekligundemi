import { SitePage } from "@/components/site-page";
import { CONTACT_EMAIL, PUBLISHER_NAME } from "@/lib/publisher";
import { SITE_ORIGIN } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK",
  description: "6698 sayılı Kanun kapsamında kişisel verilerin işlenmesi.",
  alternates: { canonical: `${SITE_ORIGIN}/kvkk` },
  openGraph: { url: `${SITE_ORIGIN}/kvkk`, title: "KVKK" },
};

export default function KvkkPage() {
  return (
    <SitePage title="Kişisel Verilerin Korunması">
      <p>
        Bu metin 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) hakkında
        genel bilgilendirmedir. Ayrıntılı işleme amaçları{" "}
        <a href="/aydinlatma-metni" className="text-[var(--brand)] underline">
          aydınlatma metninde
        </a>{" "}
        yer alır. Saklama süreleri için{" "}
        <a href="/yasal/kvkk-saklama-imha" className="text-[var(--brand)] underline">
          saklama ve imha
        </a>{" "}
        sayfasına bakın.
      </p>
      <p>
        Veri sorumlusu: {PUBLISHER_NAME}. Başvuru:{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--brand)] underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
      <p>
        İşlenen veriler arasında site kullanımı (IP, tarayıcı, çerez tercihleri),
        iletişim formunda verdiğiniz ad ve e-posta, hesaplama araçlarında
        girdiğiniz ve sunucuya kaydedilmeyen oturum verileri bulunur. Hesap
        araçlarındaki maaş ve prim bilgileri tarayıcınızda kalır; veritabanına
        yazılmaz.
      </p>
      <p>
        KVKK madde 11 kapsamında verilerinizin işlenip işlenmediğini öğrenme,
        düzeltme, silme, aktarıldığı üçüncü kişileri bilme ve işleme itiraz
        etme haklarınız vardır. Başvurularınıza 30 gün içinde yanıt verilir.
      </p>
      <p>
        Metin hukuki tavsiye değildir.
      </p>
    </SitePage>
  );
}
