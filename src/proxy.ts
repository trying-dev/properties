import { NextRequest, NextResponse } from 'next/server'
import { auth } from '+/lib/auth'
import { buildLoginUrl } from '+/lib/postLoginRedirect'

type UserRole = 'admin' | 'tenant'
type AdminLevel = 'SUPER_ADMIN' | 'MANAGER' | 'STANDARD' | 'LIMITED'

const roleRouteAccess = {
  admin: {
    SUPER_ADMIN: [
      '/dashboard',
      '/dashboard/admin',
      '/dashboard/admin/super',
      '/dashboard/admin/manager',
      '/dashboard/admin/users',
      '/dashboard/admin/settings',
      '/dashboard/admin/payments',
      '/dashboard/tenant',
    ],
    MANAGER: ['/dashboard/admin', '/dashboard/admin/manager', '/dashboard/admin/users', '/dashboard/admin/payments'],
    STANDARD: ['/dashboard/admin', '/dashboard/admin/properties', '/dashboard/admin/payments'],
    LIMITED: ['/dashboard'],
  },
  tenant: ['/dashboard/tenant'],
}

let envChecked = false
let envValid = false

const validateEnvironmentVariables = () => {
  if (envChecked) return envValid

  const requiredEnvVars = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    console.error(`❌ Variables de entorno faltantes: ${missingVars.join(', ')}`)
    console.error('🚨 La aplicación no puede funcionar sin estas variables de entorno')
    envValid = false
  } else {
    console.log('✅ Variables de entorno validadas correctamente')
    envValid = true
  }

  if (envValid) envChecked = true
  return envValid
}

export default async function proxy(request: NextRequest) {
  if (!validateEnvironmentVariables()) {
    console.error('🚨 Proxy detenido por falta de variables de entorno')
    return NextResponse.json(
      {
        error: 'Server configuration error',
        message: 'Required environment variables are missing',
      },
      { status: 500 }
    )
  }

  const session = await auth()
  const pathname = request.nextUrl.pathname

  // Filtrar logs innecesarios
  if (pathname.startsWith('/.well-known') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // console.log(
  //   `🛡️ ${pathname} - ${session ? `${session.user.email} (${session.user.role}${session.user.adminLevel ? `:${session.user.adminLevel}` : ''})` : 'Anonymous'}`
  // )

  // 🚫 Proteger rutas de dashboard y aplicación
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/process'))) {
    // Se recuerda el destino para volver ahí después de iniciar sesión (p. ej. enlace de un correo).
    return NextResponse.redirect(new URL(buildLoginUrl(`${pathname}${request.nextUrl.search}`), request.url))
  }

  // 🔐 Verificar acceso granular dentro del dashboard
  if (session && pathname.startsWith('/dashboard')) {
    const userRole = session.user.role as UserRole
    let allowedRoutes: string[] = []

    if (userRole === 'admin') {
      const adminLevel = session.user.adminLevel as AdminLevel
      allowedRoutes = roleRouteAccess.admin[adminLevel] || []
      // console.log(`👑 Admin ${adminLevel} verificando acceso a ${pathname}`)
    } else if (userRole === 'tenant') {
      allowedRoutes = roleRouteAccess.tenant
      // console.log(`🏠 Tenant verificando acceso a ${pathname}`)
    } else {
      // console.log(`❌ Rol no reconocido: ${userRole}`)
      return NextResponse.redirect(new URL('/', request.url))
    }

    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route))

    if (!hasAccess) {
      console.log(`❌ ${userRole}${session.user.adminLevel ? `:${session.user.adminLevel}` : ''} no tiene acceso a ${pathname}`)
      console.log(`📋 Rutas permitidas: ${allowedRoutes.join(', ')}`)
      return NextResponse.redirect(new URL('/', request.url))
    }

    // console.log(`✅ Acceso permitido`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
