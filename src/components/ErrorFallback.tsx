'use client'

import Link from 'next/link'
import { AlertTriangle, WifiOff, ShieldAlert, Home } from 'lucide-react'
import type { ErrorType } from '+/lib/error-logger'

interface ErrorFallbackProps {
  errorType?: ErrorType
  message?: string
  onReset?: () => void
}

const configByType: Record<ErrorType, { icon: typeof AlertTriangle; title: string; description: string }> = {
  generic: {
    icon: AlertTriangle,
    title: 'Algo sali\u00f3 mal',
    description: 'Ocurri\u00f3 un error inesperado. Por favor intenta de nuevo.',
  },
  network: {
    icon: WifiOff,
    title: 'Error de conexi\u00f3n',
    description: 'No se pudo conectar con el servidor. Verifica tu conexi\u00f3n a internet.',
  },
  auth: {
    icon: ShieldAlert,
    title: 'Sesi\u00f3n expirada',
    description: 'Tu sesi\u00f3n ha expirado. Ser\u00e1s redirigido al inicio.',
  },
  not_found: {
    icon: Home,
    title: 'P\u00e1gina no encontrada',
    description: 'La p\u00e1gina que buscas no existe o fue movida.',
  },
}

export default function ErrorFallback({ errorType = 'generic', message, onReset }: ErrorFallbackProps) {
  const config = configByType[errorType]
  const Icon = config.icon

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Icon className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{config.title}</h2>
        <p className="text-gray-600 mb-6">{message ?? config.description}</p>
        <div className="flex items-center justify-center gap-3">
          {onReset && errorType !== 'auth' && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
