import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { getAdminContext } from "@/lib/admin-auth";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAdminContext();
  if (!ctx.ok) {
    if (ctx.status === 401) redirect("/admin/login");
    if (ctx.status === 404) redirect("/admin/login");
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center">
        <h1 className="text-xl font-semibold text-slate-800">Yetkisiz</h1>
        <p className="max-w-md text-sm text-slate-600">{ctx.message}</p>
      </div>
    );
  }

  return (
    <>
      <AdminShell role={ctx.role}>
        <div className="w-full">{children}</div>
      </AdminShell>
      <Toaster richColors />
    </>
  );
}
