import { NextResponse } from "next/server";
import { forbidIfCannotWrite, requireAdminApi } from "@/lib/admin-auth";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "@/lib/store";
import { revalidateTenantContent } from "@/lib/revalidate-tenant";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const data = await getCategories(ctx.tenantId);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Kategoriler alınamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;
  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    sort_order?: number;
  };
  if (!body.name || !body.slug) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const category = await createCategory(ctx.tenantId, {
      name: body.name,
      slug: body.slug,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    });
    revalidateTenantContent({
      tenantId: ctx.tenantId,
      categorySlugs: [category.slug],
    });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;
  const body = (await request.json()) as {
    id?: string;
    name?: string;
    slug?: string;
    sort_order?: number;
    meta_title?: string | null;
    meta_description?: string | null;
  };
  if (!body.id || !body.name || !body.slug) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const before = await getCategory(ctx.tenantId, body.id);
    const category = await updateCategory(ctx.tenantId, {
      id: body.id,
      tenant_id: ctx.tenantId,
      name: body.name,
      slug: body.slug,
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
      meta_title: body.meta_title ?? null,
      meta_description: body.meta_description ?? null,
    });
    revalidateTenantContent({
      tenantId: ctx.tenantId,
      categorySlugs: [before?.slug, category.slug],
    });
    return NextResponse.json(category);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;
  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const before = await getCategory(ctx.tenantId, body.id);
    await deleteCategory(ctx.tenantId, body.id);
    revalidateTenantContent({
      tenantId: ctx.tenantId,
      categorySlugs: [before?.slug],
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
