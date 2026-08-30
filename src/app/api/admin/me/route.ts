import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx.ok) {
    return NextResponse.json(
      { canPublish: false, role: null, message: ctx.message },
      { status: ctx.status }
    );
  }
  return NextResponse.json({
    canPublish: ctx.canPublish,
    role: ctx.role,
    canEditSettings: ctx.canEditSettings,
  });
}
