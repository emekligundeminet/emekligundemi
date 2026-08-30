"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderTree,
  FileText,
  Download,
  Menu,
  X,
  UserRound,
  Settings,
  Newspaper,
  Calculator,
  Stamp,
  Scale,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin-logout-button";
import type { TenantRole } from "@/types/tenant-role";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cek", label: "Haber Çek", icon: Download },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/authors", label: "Yazarlar", icon: UserRound },
  { href: "/admin/sources", label: "Kaynaklar", icon: Newspaper },
  { href: "/admin/articles", label: "Haberler", icon: FileText },
  { href: "/admin/parametreler", label: "Hesap parametreleri", icon: Calculator },
  { href: "/admin/kunye", label: "Künye", icon: Stamp },
  { href: "/admin/yasal", label: "Yasal sayfalar", icon: Scale },
  { href: "/admin/settings", label: "Site ayarları", icon: Settings },
];

export function AdminSidebar({ role }: { role?: TenantRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <nav className="flex-1 space-y-1 p-3">
      {navItems
        .filter(
          (item) =>
            !(
              role === "author" &&
              (item.href === "/admin/settings" ||
                item.href === "/admin/parametreler" ||
                item.href === "/admin/kunye" ||
                item.href === "/admin/yasal")
            )
        )
        .map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-indigo-600 text-white font-semibold"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className="size-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white px-4 md:hidden">
        <Link href="/admin/dashboard" className="font-semibold text-slate-800">
          Admin Paneli
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex size-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Menüyü aç/kapat"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-xl md:hidden">
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
              <Link
                href="/admin/dashboard"
                className="font-semibold text-slate-800"
                onClick={() => setOpen(false)}
              >
                Admin Paneli
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            {navContent}
            <div className="border-t border-slate-100 p-3">
              {role ? (
                <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Rol: {role}
                </p>
              ) : null}
              <AdminLogoutButton />
            </div>
          </aside>
        </>
      )}

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-sm md:flex">
        <div className="flex h-14 items-center border-b border-slate-100 px-5">
          <Link href="/admin/dashboard" className="font-semibold text-slate-800">
            Admin Paneli
          </Link>
        </div>
        {navContent}
        <div className="border-t border-slate-100 p-3">
          {role ? (
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Rol: {role}
            </p>
          ) : null}
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Siteye dön
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>
    </>
  );
}
