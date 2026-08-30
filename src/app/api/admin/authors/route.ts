import { NextResponse } from "next/server";
import { forbidIfCannotWrite, requireAdminApi } from "@/lib/admin-auth";
import {
  createAuthor,
  deleteAuthor,
  getAuthors,
  updateAuthor,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  try {
    const data = await getAuthors(ctx.tenantId);
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
    bio?: string | null;
  };
  if (!body.name?.trim()) {
    return NextResponse.json({ message: "Yazar adı gerekli." }, { status: 400 });
  }
  try {
    const author = await createAuthor(ctx.tenantId, {
      name: body.name.trim(),
      logo_url: typeof body.logo_url === "string" ? body.logo_url.trim() || null : null,
      bio: typeof body.bio === "string" ? body.bio.trim() || null : null,
    });
    return NextResponse.json(author);
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
    bio?: string | null;
  };
  if (!body.id || !body.name?.trim()) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const author = await updateAuthor(ctx.tenantId, {
      id: body.id,
      tenant_id: ctx.tenantId,
      name: body.name.trim(),
      logo_url: typeof body.logo_url === "string" ? body.logo_url.trim() || null : null,
      bio: typeof body.bio === "string" ? body.bio.trim() || null : null,
    });
    return NextResponse.json(author);
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
    await deleteAuthor(ctx.tenantId, body.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
