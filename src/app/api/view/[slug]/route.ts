import { NextResponse } from "next/server";
import { getTenant } from "@/lib/tenant";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const COOKIE = "emekliler_viewed";
const DAY = 60 * 60 * 24;

function viewedSet(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  return new Set(raw.split("|").filter(Boolean).slice(-40));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const tenant = await getTenant();
  if (!tenant) return NextResponse.json({ ok: false }, { status: 404 });

  const { slug } = await params;
  const clean = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!clean || clean.length > 180) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ip = clientIp(request);
  if (!rateLimit(`view:${tenant.tenant_id}:${ip}`, 40, 60_000)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const raw = cookieHeader
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  const seen = viewedSet(raw);
  if (seen.has(clean)) {
    return NextResponse.json({ ok: true, counted: false });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("increment_article_view", {
    p_tenant_id: tenant.tenant_id,
    p_slug: clean,
  });
  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  seen.add(clean);
  const res = NextResponse.json({ ok: true, counted: true });
  res.cookies.set(COOKIE, [...seen].join("|"), {
    maxAge: DAY,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
  });
  return res;
}
