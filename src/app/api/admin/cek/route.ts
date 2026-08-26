import { NextResponse } from "next/server";
import { tara } from "@/lib/scrape";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST() {
  try {
    const data = await tara();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Tarama başarısız." },
      { status: 500 }
    );
  }
}
