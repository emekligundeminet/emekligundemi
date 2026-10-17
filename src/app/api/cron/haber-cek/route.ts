import { NextResponse } from "next/server";
import { haberHattiniCalistir } from "@/lib/otomatik/haber-hatti";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Vercel Cron her çağrıda `Authorization: Bearer $CRON_SECRET` gönderir. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Yetkisiz." }, { status: 401 });
  }
  try {
    const sonuc = await haberHattiniCalistir();
    console.log(`[haber-cek] ${sonuc.mesaj}`, sonuc.hatalar);
    return NextResponse.json(sonuc, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Otomatik çekme başarısız.";
    console.error(`[haber-cek] ${message}`);
    return NextResponse.json({ message }, { status: 500 });
  }
}
