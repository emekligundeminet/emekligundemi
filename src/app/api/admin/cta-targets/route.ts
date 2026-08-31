import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { listGuideTargets } from "@/lib/store";
import { CALC_TOOLS } from "@/lib/calc-tools";

export const dynamic = "force-dynamic";

/** CTA kutusu yalnızca rehber ve hesaplama aracına bağlanır; haber çıkmaz. */
export async function GET(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const excludeId = new URL(request.url).searchParams.get("excludeId") ?? undefined;
  const guides = await listGuideTargets(ctx.tenantId, excludeId || undefined);
  const tools = CALC_TOOLS.map((tool) => ({
    id: tool.id,
    title: tool.title,
    path: tool.path,
  }));
  return NextResponse.json({ guides, tools });
}
