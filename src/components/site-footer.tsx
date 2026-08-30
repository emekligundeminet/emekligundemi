import Link from "next/link";
import type { Category } from "@/types/category";
import { SiteBrandLogo } from "@/components/site-brand-logo";
import { SiteSocialLinks, type SiteSocial } from "@/components/site-social";
import { isReservedBlogIndexSlug } from "@/lib/content-type";
import { PENSION_TOOL_PATH } from "@/lib/site";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[1.15rem] font-bold text-white">{children}</p>;
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-[15px] leading-8 text-[#d4d7dc] transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

/** Kurumsal / içerik / yasal — her href footer’da bir kez. */
const KURUMSAL = [
  { href: "/kunye", label: "Künye" },
  { href: "/yayin-ilkeleri", label: "Yayın İlkeleri" },
  { href: "/duzeltme", label: "Düzeltme" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/reklam", label: "Reklam" },
] as const;

const ICERIK = [
  { href: "/", label: "Tüm Haberler" },
  { href: "/arsiv", label: "Arşiv" },
  { href: "/blog", label: "Blog / Rehberler" },
  { href: PENSION_TOOL_PATH, label: "Emekli Maaşı Hesaplama" },
  { href: "/araclar/emekli-zam-hesaplama", label: "Emekli Zam Hesaplama" },
  { href: "/araclar/emekli-bayram-ikramiyesi", label: "Bayram İkramiyesi" },
  { href: "/araclar/alim-gucu-kaybi", label: "Alım Gücü Kaybı" },
] as const;

const YASAL = [
  { href: "/yasal/gizlilik", label: "Gizlilik" },
  { href: "/yasal/cerez-politikasi", label: "Çerez Politikası" },
  { href: "/yasal/kvkk-saklama-imha", label: "Saklama ve İmha" },
  { href: "/yasal/kvkk-basvuru-formu", label: "KVKK Başvuru" },
] as const;

export function SiteFooter({
  categories,
  siteName,
  social,
}: {
  categories: Category[];
  siteName: string;
  social?: SiteSocial;
}) {
  // Konu kategorileri; blog/rehber index slug’ı /blog ile çakışmasın.
  const konular = [...categories]
    .filter((c) => !isReservedBlogIndexSlug(c.slug))
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "tr"));

  return (
    <footer className="mt-12 bg-[#1e2329] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <Link href="/" className="inline-block" aria-label={siteName}>
          <SiteBrandLogo
            variant="white"
            siteName={siteName}
            className="h-9 w-auto md:h-11"
          />
        </Link>

        <div className="mt-6 border-t border-white/10" />

        <div className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FooterHeading>Kategoriler</FooterHeading>
            <ul>
              {konular.map((c) => (
                <FooterLink key={c.id} href={`/kategori/${c.slug}`}>
                  {c.name}
                </FooterLink>
              ))}
            </ul>
          </div>
          <div>
            <FooterHeading>Kurumsal</FooterHeading>
            <ul>
              {KURUMSAL.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>
          <div>
            <FooterHeading>İçerik & Araçlar</FooterHeading>
            <ul>
              {ICERIK.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>
          <div>
            <FooterHeading>Yasal</FooterHeading>
            <ul>
              {YASAL.map((item) => (
                <FooterLink key={item.href} href={item.href}>
                  {item.label}
                </FooterLink>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#d4d7dc]">
            © {new Date().getFullYear()} {siteName}
          </p>
          <SiteSocialLinks variant="dark" social={social} />
        </div>
      </div>
    </footer>
  );
}
