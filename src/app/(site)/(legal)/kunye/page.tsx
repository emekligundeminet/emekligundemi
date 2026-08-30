import { LegalPageShell } from "@/components/legal-page-shell";
import { filledKunye, getKunye, kunyeValue } from "@/lib/kunye";
import { jsonLdScript } from "@/lib/json-ld";
import { SITE_NAME, SITE_ORIGIN, staticDocumentTitle } from "@/lib/site";
import type { KunyeVeri } from "@/types/kunye";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: staticDocumentTitle("Künye") },
    description: "Emekliler internet haber sitesinin yayın künyesi.",
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_ORIGIN}/kunye` },
    openGraph: {
      title: "Künye",
      description: "Emekliler internet haber sitesinin yayın künyesi.",
      url: `${SITE_ORIGIN}/kunye`,
    },
  };
}

function kunyeJsonLd(veri: KunyeVeri) {
  const name = kunyeValue(veri, "yayin_adi") || SITE_NAME;
  const email = kunyeValue(veri, "eposta");
  const phone = kunyeValue(veri, "telefon");
  const address = kunyeValue(veri, "yonetim_yeri");
  const owner = kunyeValue(veri, "yayin_sahibi");
  const contactPoint = [
    email
      ? {
          "@type": "ContactPoint",
          contactType: "customer service",
          email,
          availableLanguage: "Turkish",
        }
      : null,
    phone
      ? {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: phone,
          availableLanguage: "Turkish",
        }
      : null,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name,
    url: SITE_ORIGIN,
    email: email || undefined,
    telephone: phone || undefined,
    address: address
      ? { "@type": "PostalAddress", streetAddress: address, addressCountry: "TR" }
      : undefined,
    founder: owner ? { "@type": "Person", name: owner } : undefined,
    contactPoint: contactPoint.length ? contactPoint : undefined,
  };
}

export default async function KunyePage() {
  const veri = await getKunye();
  const rows = filledKunye(veri);
  const eposta = kunyeValue(veri, "eposta");
  const uets = kunyeValue(veri, "uets_adresi");
  const kanallar = [eposta, uets].filter(Boolean);

  return (
    <LegalPageShell
      title="Künye"
      notice={
        kanallar.length > 0
          ? {
              title: "Cevap ve Düzeltme (Tekzip) Başvurusu",
              children: (
                <>
                  Yayınlarımıza ilişkin cevap ve düzeltme talepleriniz için{" "}
                  {eposta ? (
                    <a href={`mailto:${eposta}`} className="text-[var(--brand)] underline">
                      {eposta}
                    </a>
                  ) : null}
                  {eposta && uets ? " / " : null}
                  {uets ? <span>UETS: {uets}</span> : null} adresimiz üzerinden
                  başvurabilirsiniz.
                </>
              ),
            }
          : undefined
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(kunyeJsonLd(veri)) }}
      />

      {rows.length > 0 ? (
        <dl className="divide-y divide-neutral-200 border-y border-neutral-200">
          {rows.map((row) => (
            <div
              key={row.key}
              className="grid gap-1 py-3 sm:grid-cols-[14rem_1fr] sm:items-baseline sm:gap-6"
            >
              <dt className="text-[13px] font-semibold text-neutral-500 sm:text-[15px] sm:text-neutral-800">
                {row.label}
              </dt>
              <dd className="text-[15px] text-neutral-800">
                {row.key === "eposta" ? (
                  <a href={`mailto:${row.value}`} className="text-[var(--brand)] underline">
                    {row.value}
                  </a>
                ) : row.key === "telefon" ? (
                  <a href={`tel:${row.value.replace(/\s+/g, "")}`} className="text-[var(--brand)] underline">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>Künye bilgileri henüz girilmedi.</p>
      )}
    </LegalPageShell>
  );
}
