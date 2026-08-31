import { NextResponse } from "next/server";
import { adsenseClientId } from "@/lib/ads";

export const dynamic = "force-dynamic";

/** AdSense yokken 404 — sahte satır yazma. */
export function GET() {
  const client = adsenseClientId();
  if (!client) {
    return new NextResponse("Not found", { status: 404 });
  }
  const pub = client.replace(/^ca-/, "");
  const body = `google.com, ${pub}, DIRECT, f08c47fec0942fa2\n`;
  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" },
  });
}
