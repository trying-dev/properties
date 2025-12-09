'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '+/hooks/useSession'

export default function DashboardLoading() {
  const router = useRouter()
  const { session, status } = useSession()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let mounted = true

    const checkSessionAndRedirect = () => {
      startTransition(async () => {
        try {
          console.log('🔍 Verificando sesión...', { status, session: !!session })

          if (!mounted) return

          if (status === 'loading') {
            return
          }

          if (status === 'unauthenticated' || !session || !session.user) {
            console.log('❌ No hay sesión activa, redirigiendo a login')
            router.push('/')
            return
          }

          const { role, adminLevel } = session.user
          console.log(
            `👤 Usuario autenticado: ${session.user.email} (${role}${adminLevel ? `:${adminLevel}` : ''})`
          )

          setIsRedirecting(true)

          let redirectUrl = '/dashboard'

          if (role === 'admin') {
            redirectUrl = '/dashboard/admin'
            console.log(`👑 Redirigiendo admin a: ${redirectUrl}`)
          } else if (role === 'tenant') {
            redirectUrl = '/dashboard/tenant'
            console.log(`🏠 Redirigiendo tenant a: ${redirectUrl}`)
          } else {
            console.log(`❓ Rol desconocido: ${role}`)
            setError('Rol de usuario no reconocido')
            return
          }

          setTimeout(() => {
            if (mounted) {
              router.push(redirectUrl)
            }
          }, 800)
        } catch (err) {
          console.error('Error al verificar sesión:', err)
          if (mounted) {
            setError('Error al verificar la sesión')

            setTimeout(() => {
              router.push('/')
            }, 2000)
          }
        }
      })
    }

    if (status !== 'loading') {
      checkSessionAndRedirect()
    }

    return () => {
      mounted = false
    }
  }, [router, session, status, startTransition])

  const isLoading = status === 'loading' || isPending

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50">
      <div className="text-center">
        {/* Logo o Icono */}
        <div className="w-20 h-20 mx-auto mb-6 text-blue-600">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            className={`${isRedirecting ? 'animate-bounce' : 'animate-pulse'}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>

        {/* Spinner de carga */}
        <div className="w-12 h-12 mx-auto mb-6">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              isRedirecting ? 'border-green-600' : 'border-blue-600'
            }`}
          ></div>
        </div>

        {/* Texto del estado */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          {isRedirecting
            ? '¡Acceso Confirmado!'
            : isLoading
              ? 'Verificando acceso...'
              : 'Preparando dashboard...'}
        </h2>

        <p className="text-gray-600 mb-4">
          {isRedirecting
            ? 'Te estamos llevando a tu dashboard'
            : isLoading
              ? 'Validando tus credenciales y permisos'
              : 'Cargando información de usuario...'}
        </p>

        {/* Indicador de progreso mejorado */}
        <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              isRedirecting ? 'w-full bg-green-600' : isLoading ? 'w-2/3 bg-blue-600' : 'w-1/3 bg-blue-400'
            }`}
          ></div>
        </div>

        {/* Estados de progreso */}
        <div className="flex justify-center space-x-4 mb-6">
          <div
            className={`flex items-center space-x-2 ${
              status !== 'loading' ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full ${status !== 'loading' ? 'bg-green-600' : 'bg-gray-300'}`}
            ></div>
            <span className="text-sm">Sesión</span>
          </div>

          <div
            className={`flex items-center space-x-2 ${session?.user ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div className={`w-3 h-3 rounded-full ${session?.user ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Usuario</span>
          </div>

          <div
            className={`flex items-center space-x-2 ${isRedirecting ? 'text-green-600' : 'text-gray-400'}`}
          >
            <div className={`w-3 h-3 rounded-full ${isRedirecting ? 'bg-green-600' : 'bg-gray-300'}`}></div>
            <span className="text-sm">Redirección</span>
          </div>
        </div>

        {/* Texto adicional con info de sesión */}
        <p className="text-sm text-gray-500 mt-4">
          {session?.user?.email ? (
            <>
              Bienvenido, <span className="font-medium">{session.user.email}</span>
            </>
          ) : (
            'Por favor espera un momento...'
          )}
        </p>

        {/* Debug info en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <p>Status: {status}</p>
            <p>Has Session: {session ? 'Sí' : 'No'}</p>
            <p>Role: {session?.user?.role || 'N/A'}</p>
            <p>Is Pending: {isPending ? 'Sí' : 'No'}</p>
            <p>Is Redirecting: {isRedirecting ? 'Sí' : 'No'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
