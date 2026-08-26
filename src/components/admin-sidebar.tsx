"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderTree, FileText, Download, Menu, X } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cek", label: "Haber Çek", icon: Download },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/articles", label: "Haberler", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navContent = (
    <nav className="flex-1 space-y-1 p-3">
      {navItems.map((item) => {
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
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            Siteye dön
          </Link>
        </div>
      </aside>
    </>
  );
}
