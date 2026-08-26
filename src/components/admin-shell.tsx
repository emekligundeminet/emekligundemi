"use client";

import { AdminSidebar } from "@/components/admin-sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <AdminSidebar />
      <main className="flex-1 overflow-auto p-3 sm:p-5 lg:p-8">{children}</main>
    </div>
  );
}
