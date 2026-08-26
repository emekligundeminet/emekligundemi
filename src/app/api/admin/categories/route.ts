import { NextResponse } from "next/server";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/lib/store";

export async function GET() {
  const data = await listCategories();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    slug?: string;
    meta_title?: string | null;
    meta_description?: string | null;
  };
  if (!body.name || !body.slug) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const category = await createCategory({
      name: body.name,
      slug: body.slug,
      meta_title: typeof body.meta_title === "string" ? body.meta_title.trim() || null : null,
      meta_description:
        typeof body.meta_description === "string" ? body.meta_description.trim() || null : null,
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
  const body = (await request.json()) as {
    id?: string;
    name?: string;
    slug?: string;
    meta_title?: string | null;
    meta_description?: string | null;
  };
  if (!body.id || !body.name || !body.slug) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    const category = await updateCategory({
      id: body.id,
      name: body.name,
      slug: body.slug,
      meta_title: typeof body.meta_title === "string" ? body.meta_title.trim() || null : null,
      meta_description:
        typeof body.meta_description === "string" ? body.meta_description.trim() || null : null,
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
  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  try {
    await deleteCategory(body.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Hata" },
      { status: 400 }
    );
  }
}
