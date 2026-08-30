import { NextResponse } from "next/server";
import { getTenant } from "@/lib/tenant";
import { getCategories } from "@/lib/store";
import { isReservedBlogIndexSlug } from "@/lib/content-type";

export const dynamic = "force-dynamic";

/** Header menü: her istekte güncel kategori listesi. */
export async function GET() {
  const tenant = await getTenant();
  if (!tenant) return NextResponse.json([]);
  try {
    const rows = await getCategories(tenant.tenant_id);
    return NextResponse.json(
      rows
        .filter((c) => !isReservedBlogIndexSlug(c.slug))
        .map((c) => ({ name: c.name, slug: c.slug }))
    );
  } catch {
    return NextResponse.json([]);
  }
}
