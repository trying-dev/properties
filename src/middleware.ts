import { NextRequest, NextResponse } from "next/server";
import { auth } from " +/lib/auth";

type UserRole = "admin" | "tenant";
type AdminLevel = "SUPER_ADMIN" | "MANAGER" | "STANDARD" | "LIMITED";

const roleRouteAccess = {
  admin: {
    SUPER_ADMIN: [
      "/dashboard",
      "/dashboard/admin",
      "/dashboard/admin/super",
      "/dashboard/admin/manager",
      "/dashboard/admin/users",
      "/dashboard/admin/settings",
      "/dashboard/tenant",
    ],
    MANAGER: ["/dashboard", "/dashboard/admin", "/dashboard/admin/manager", "/dashboard/admin/users"],
    STANDARD: ["/dashboard", "/dashboard/admin", "/dashboard/admin/properties"],
    LIMITED: ["/dashboard"],
  },
  tenant: ["/dashboard", "/dashboard/tenant"],
};

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Filtrar logs innecesarios
  if (pathname.startsWith("/.well-known") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  console.log(
    `🛡️ ${pathname} - ${session ? `${session.user.email} (${session.user.role}${session.user.adminLevel ? `:${session.user.adminLevel}` : ""})` : "Anonymous"}`,
  );

  // 🚫 Proteger todas las rutas de dashboard
  if (!session && pathname.startsWith("/dashboard")) {
    console.log(`❌ No autenticado, redirigiendo a login`);
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🔐 Verificar acceso granular dentro del dashboard
  if (session && pathname.startsWith("/dashboard")) {
    const userRole = session.user.role as UserRole;
    let allowedRoutes: string[] = [];

    if (userRole === "admin") {
      const adminLevel = session.user.adminLevel as AdminLevel;
      allowedRoutes = roleRouteAccess.admin[adminLevel] || [];
      console.log(`👑 Admin ${adminLevel} verificando acceso a ${pathname}`);
    } else if (userRole === "tenant") {
      allowedRoutes = roleRouteAccess.tenant;
      console.log(`🏠 Tenant verificando acceso a ${pathname}`);
    } else {
      console.log(`❌ Rol no reconocido: ${userRole}`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      console.log(
        `❌ ${userRole}${session.user.adminLevel ? `:${session.user.adminLevel}` : ""} no tiene acceso a ${pathname}`,
      );
      console.log(`📋 Rutas permitidas: ${allowedRoutes.join(", ")}`);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    console.log(`✅ Acceso permitido`);
  }

  // 🔄 Redirigir usuarios logueados desde home al dashboard
  if (session && pathname === "/") {
    console.log(`🔄 Usuario logueado redirigido a dashboard`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
