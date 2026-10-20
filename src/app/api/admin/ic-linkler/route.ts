import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { forbidIfCannotEditSettings, requireAdminApi } from "@/lib/admin-auth";
import { cacheTags } from "@/lib/cache-tags";
import { CALC_TOOLS } from "@/lib/calc-tools";
import { icLinkAyarlari } from "@/lib/ic-link";
import { ayarlariGuncelle } from "@/lib/otomatik/stok";
import { getCategories, listGuideTargets } from "@/lib/store";
import { getTenant } from "@/lib/tenant";

export const dynamic = "force-dynamic";

/** Kurallar + hedef seçicisi için araçlar, rehberler ve kategoriler. */
export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const [tenant, rehberler, kategoriler] = await Promise.all([
      getTenant(),
      listGuideTargets(ctx.tenantId),
      getCategories(ctx.tenantId),
    ]);
    const hedefler = [
      ...CALC_TOOLS.map((t) => ({ grup: "Hesaplama aracı", ad: t.title, yol: t.path })),
      ...rehberler.map((r) => ({ grup: "Rehber (blog)", ad: r.title, yol: r.path })),
      ...kategoriler
        .filter((k) => k.slug !== "blog")
        .map((k) => ({ grup: "Kategori", ad: k.name, yol: `/kategori/${k.slug}` })),
    ];
    return NextResponse.json({ ...icLinkAyarlari(tenant?.settings), hedefler });
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Hata" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotEditSettings(ctx);
  if (denied) return denied;

  const body = await request.json().catch(() => null);
  // Doğrulama/temizlik okuyucuyla aynı fonksiyondan geçer.
  const temiz = icLinkAyarlari({ icLinkler: body?.kayitlar, icLinkMax: body?.max });
  try {
    await ayarlariGuncelle(ctx.tenantId, (settings) => {
      settings.icLinkler = temiz.kayitlar;
      settings.icLinkMax = temiz.max;
    });
    const tags = cacheTags(ctx.tenantId);
    revalidateTag(tags.home, "max");
    revalidateTag(tags.articles, "max");
    return NextResponse.json(temiz);
  } catch (err) {
    return NextResponse.json({ message: err instanceof Error ? err.message : "Kaydedilemedi." }, { status: 400 });
  }
}
