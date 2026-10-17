import { after, NextResponse } from "next/server";
import { haberHattiniCalistir } from "@/lib/otomatik/haber-hatti";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function calistir() {
  try {
    const sonuc = await haberHattiniCalistir();
    console.log(`[haber-cek] ${sonuc.mesaj}`, sonuc.hatalar);
    return { sonuc, status: 200 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Otomatik çekme başarısız.";
    console.error(`[haber-cek] ${message}`);
    return { sonuc: { message }, status: 500 };
  }
}

/**
 * cron-job.org `Authorization: Bearer $CRON_SECRET` ile çağırır. Ücretsiz plan
 * 30 sn bekler; tur daha uzun sürebildiği için hemen 202 döner, iş arka planda
 * biter (sonuç Vercel loglarında). Elle denerken `?bekle=1` sonucu döndürür.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ message: "Yetkisiz." }, { status: 401 });
  }
  const headers = { "Cache-Control": "no-store" };
  if (new URL(request.url).searchParams.get("bekle") === "1") {
    const { sonuc, status } = await calistir();
    return NextResponse.json(sonuc, { status, headers });
  }
  after(calistir);
  return NextResponse.json({ message: "Başladı." }, { status: 202, headers });
}
