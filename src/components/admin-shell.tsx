"use client";

import { AdminSidebar } from "@/components/admin-sidebar";
import type { TenantRole } from "@/types/tenant-role";

export function AdminShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: TenantRole;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <AdminSidebar role={role} />
      <main className="flex-1 overflow-auto p-3 sm:p-5 lg:p-8">{children}</main>
    </div>
  );
}
