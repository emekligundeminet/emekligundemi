import { NextResponse } from "next/server";
import { gonderAi } from "@/lib/ai-revise";
import type { CekilenHaber } from "@/lib/scrape";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const haber = (await request.json()) as CekilenHaber;
  if (!haber?.link || !haber?.baslik) {
    return NextResponse.json({ message: "Haber eksik." }, { status: 400 });
  }
  const sonuc = await gonderAi(haber);
  return NextResponse.json(sonuc, {
    headers: { "Cache-Control": "no-store" },
  });
}
