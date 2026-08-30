import { NextResponse } from "next/server";
import { forbidIfCannotWrite, requireAdminApi } from "@/lib/admin-auth";
import {
  createSource,
  deleteSource,
  getSources,
  updateSource,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const data = await getSources(ctx.tenantId);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
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
    logo_url?: string | null;
  };
  if (!body.name?.trim()) {
    return NextResponse.json({ message: "Kaynak adı gerekli." }, { status: 400 });
  }
  try {
    const source = await createSource(ctx.tenantId, {
      name: body.name.trim(),
      logo_url: typeof body.logo_url === "string" ? body.logo_url.trim() || null : null,
    });
    return NextResponse.json(source);
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
    logo_url?: string | null;
  };
  if (!body.id || !body.name?.trim()) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const source = await updateSource(ctx.tenantId, {
      id: body.id,
      tenant_id: ctx.tenantId,
      name: body.name.trim(),
      logo_url: typeof body.logo_url === "string" ? body.logo_url.trim() || null : null,
    });
    return NextResponse.json(source);
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
    await deleteSource(ctx.tenantId, body.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
