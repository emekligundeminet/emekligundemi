import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/adminClient";
import { hostnameFromHostHeader, lookupTenantByHostname } from "@/lib/tenant-lookup";
import { tenantCacheRewritePath } from "@/lib/tenant-rewrite";

function isAdminLogin(pathname: string) {
  return pathname === "/admin/login" || pathname.startsWith("/admin/login/");
}

function isAdminPage(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isAdminApi(pathname: string) {
  return pathname === "/api/admin" || pathname.startsWith("/api/admin/");
}

/** www.emekliler.org → emekliler.org. domains tablosunda www satırı gerekmez. */
function redirectWwwToApex(request: NextRequest): NextResponse | null {
  const raw = (
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    ""
  )
    .split(",")[0]
    ?.trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
  if (!raw?.startsWith("www.")) return null;
  const apex = raw.slice(4);
  if (!apex || apex === "localhost") return null;
  const dest = request.nextUrl.clone();
  dest.hostname = apex;
  return NextResponse.redirect(dest, 308);
}

export async function middleware(request: NextRequest) {
  const wwwRedirect = redirectWwwToApex(request);
  if (wwwRedirect) return wwwRedirect;

  const pathname = request.nextUrl.pathname;
  const hostTenant = await lookupTenantByHostname(
    hostnameFromHostHeader(
      request.headers.get("x-forwarded-host") ?? request.headers.get("host")
    )
  );

  // Doğrudan /t/uuid/... yalnızca host'un kendi tenant'ı
  if (pathname.startsWith("/t/")) {
    const claimed = pathname.split("/")[2] ?? "";
    if (!hostTenant || claimed !== hostTenant.tenant_id) {
      return new NextResponse("Not found", { status: 404 });
    }
  } else if (hostTenant && !isAdminPage(pathname) && !isAdminApi(pathname)) {
    const dest = tenantCacheRewritePath(pathname, hostTenant.tenant_id);
    if (dest && dest !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = dest;
      return NextResponse.rewrite(url);
    }
  }

  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const needsAuth = (isAdminPage(pathname) && !isAdminLogin(pathname)) || isAdminApi(pathname);
  const isLogout = pathname === "/api/admin/logout";
  if (!needsAuth) return response;

  if (!user) {
    if (isLogout) return response;
    if (isAdminApi(pathname)) {
      return NextResponse.json({ message: "Oturum gerekli." }, { status: 401 });
    }
    const login = request.nextUrl.clone();
    login.pathname = "/admin/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (!hostTenant) {
    if (isAdminApi(pathname)) {
      return NextResponse.json({ message: "Tenant bulunamadı." }, { status: 404 });
    }
    return new NextResponse("Tenant bulunamadı.", { status: 404 });
  }

  const admin = createSupabaseAdminClient();
  const { data: member } = await admin
    .from("tenant_members")
    .select("role")
    .eq("tenant_id", hostTenant.tenant_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    if (isAdminApi(pathname)) {
      return NextResponse.json({ message: "Bu site için yetkiniz yok." }, { status: 403 });
    }
    return new NextResponse("Bu site için yetkiniz yok.", {
      status: 403,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|fonts|.*\\..*).*)"],
};
