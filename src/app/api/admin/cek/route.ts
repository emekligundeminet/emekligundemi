import { NextResponse } from "next/server";
import { forbidIfCannotWrite, requireAdminApi } from "@/lib/admin-auth";
import { getTenant } from "@/lib/tenant";
import { updateTenantSettings } from "@/lib/store";
import { tara } from "@/lib/scrape";
import {
  parseScrapeConfigInput,
  scrapeConfigFromSettings,
  scrapeSettingsPatch,
  type ScrapeConfig,
} from "@/lib/scrape-config";
import type { Json } from "@/types/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

function asRecord(settings: Json): Record<string, unknown> {
  if (settings && typeof settings === "object" && !Array.isArray(settings)) {
    return { ...(settings as Record<string, unknown>) };
  }
  return {};
}

async function tenantFor(ctxTenantId: string) {
  const tenant = await getTenant();
  if (!tenant || tenant.tenant_id !== ctxTenantId) return null;
  return tenant;
}

async function persistConfig(tenantId: string, settings: Json, config: ScrapeConfig) {
  const merged = { ...asRecord(settings), ...scrapeSettingsPatch(config) };
  await updateTenantSettings(tenantId, merged);
}

export async function GET() {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const tenant = await tenantFor(ctx.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: "Tenant bulunamadı." }, { status: 404 });
  }
  const { config, saved } = scrapeConfigFromSettings(tenant.settings);
  return NextResponse.json({ config, saved });
}

export async function PATCH(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;
  const denied = forbidIfCannotWrite(ctx);
  if (denied) return denied;
  const tenant = await tenantFor(ctx.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: "Tenant bulunamadı." }, { status: 404 });
  }
  try {
    const config = parseScrapeConfigInput(await request.json());
    await persistConfig(ctx.tenantId, tenant.settings, config);
    return NextResponse.json({ config, saved: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Kaydedilemedi." },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  const ctx = await requireAdminApi();
  if (ctx instanceof NextResponse) return ctx;

  if (process.env.VERCEL) {
    return NextResponse.json(
      { message: "Haber çekme yalnızca localde çalışır (npm run dev). Vercel’de tarama yok." },
      { status: 403 }
    );
  }

  const tenant = await tenantFor(ctx.tenantId);
  if (!tenant) {
    return NextResponse.json({ message: "Tenant bulunamadı." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  let config = scrapeConfigFromSettings(tenant.settings).config;
  if (body && typeof body === "object" && !Array.isArray(body) && "feeds" in body) {
    const denied = forbidIfCannotWrite(ctx);
    if (denied) return denied;
    try {
      config = parseScrapeConfigInput(body);
      await persistConfig(ctx.tenantId, tenant.settings, config);
    } catch (err) {
      return NextResponse.json(
        { message: err instanceof Error ? err.message : "Geçersiz tarama ayarı." },
        { status: 400 }
      );
    }
  }

  try {
    const data = await tara(config);
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
