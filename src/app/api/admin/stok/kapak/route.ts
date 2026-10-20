import { NextResponse } from "next/server";
import { forbidIfCannotWrite, requireAdminApi } from "@/lib/admin-auth";
import { slugify } from "@/lib/slugify";
import { getTenant } from "@/lib/tenant";
import { KAPAK_H, KAPAK_W, kapakUret } from "@/lib/otomatik/kapak";
import { kapakIcinKisalt } from "@/lib/otomatik/konu";
import { kapakYukle, stokAltlari, stokKlasoru, stokVeri } from "@/lib/otomatik/stok";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Haber formundaki "Stoktan kapak seç": seçilen stok fotoğrafı yazısız
 * 1600×900 kapak yapar; path yoksa kırmızı zemin + başlık + logo.
 */
export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    path?: string | null;
    baslik?: string;
    kategori?: string;
  } | null;
  const path = body?.path ?? null;
  const baslik = body?.baslik?.trim() || "";
  if (!path && !baslik) {
    return NextResponse.json({ message: "Kırmızı kapak için başlık gerekli." }, { status: 400 });
  }
  if (path && (!path.startsWith(`${stokKlasoru(ctx.tenantId)}/`) || path.includes(".."))) {
    return NextResponse.json({ message: "Geçersiz görsel." }, { status: 400 });
  }

  try {
    const kapakBasligi = kapakIcinKisalt(baslik);
    const foto = path ? await stokVeri(path) : null;
    const png = await kapakUret(kapakBasligi, body?.kategori?.trim() || "Emekli Haberleri", foto);
    const url = await kapakYukle(ctx.tenantId, slugify(baslik || "kapak"), png, KAPAK_W, KAPAK_H);
    const altlar = path ? stokAltlari((await getTenant())?.settings) : {};
    const alt = path ? (altlar[path] ?? "") : kapakBasligi;
    return NextResponse.json({ url, alt });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Kapak üretilemedi." },
      { status: 500 }
    );
  }
}
