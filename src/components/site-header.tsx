"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SiteBrandLogo } from "@/components/site-brand-logo";
import { SiteSearchForm } from "@/components/site-search-form";
import { SiteSocialMenu, type SiteSocial } from "@/components/site-social";
import { isReservedBlogIndexSlug } from "@/lib/content-type";
import { HOME_TITLE } from "@/lib/site";
import type { Category } from "@/types/category";

type SiteHeaderProps = {
  categories: Category[];
  siteName: string;
  social?: SiteSocial;
};

export function SiteHeader({ categories, siteName, social }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navCats = categories.filter((c) => !isReservedBlogIndexSlug(c.slug));

  const links = [
    { href: "/", label: HOME_TITLE },
    ...navCats.map((c) => ({ href: `/kategori/${c.slug}`, label: c.name })),
    { href: "/blog", label: "Blog" },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="bg-[var(--brand)] text-white">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 md:h-[4.25rem] md:gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="-ml-1.5 inline-flex h-11 w-11 cursor-pointer items-center justify-center"
              aria-label="Menüyü aç"
              aria-expanded={open}
              aria-controls="site-menu"
            >
              <Menu className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2.25} />
            </button>
            <Link href="/" className="flex items-center" aria-label={siteName}>
              <SiteBrandLogo
                variant="white"
                siteName={siteName}
                className="h-8 w-auto md:h-10"
              />
            </Link>
            <div className="ml-auto hidden md:block">
              <SiteSearchForm compact />
            </div>
          </div>
        </div>

        <nav className="hidden border-b border-neutral-200 bg-white md:block">
          <ul className="nav-scroll mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 overflow-x-auto px-4 py-3 md:gap-x-6 md:overflow-visible">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "whitespace-nowrap text-[13px] font-bold uppercase tracking-wide",
                      active ? "text-[var(--brand)]" : "text-black hover:text-[var(--brand)]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
          aria-label="Menüyü kapat"
        />
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menüsü"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="relative flex h-14 items-center justify-center border-b border-neutral-200 bg-white px-12 md:h-[4.25rem]">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setOpen(false)}
              aria-label={siteName}
            >
              <SiteBrandLogo variant="color" siteName={siteName} className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 inline-flex h-11 w-11 cursor-pointer items-center justify-center text-neutral-800"
              aria-label="Kapat"
            >
              <X className="h-6 w-6" strokeWidth={2.25} />
            </button>
          </div>
          <div className="border-b border-neutral-100 px-4 py-3 md:hidden">
            <SiteSearchForm />
          </div>
          <ul className="flex-1 overflow-y-auto py-2">
            {links.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "block border-b border-neutral-100 px-5 py-3.5 text-sm font-bold uppercase tracking-wide",
                      active ? "text-[var(--brand)]" : "text-black hover:bg-neutral-50 hover:text-[var(--brand)]"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <SiteSocialMenu social={social} />
        </div>
      </div>
    </>
  );
}
