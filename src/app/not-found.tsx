'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Home className="h-8 w-8 text-gray-500" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">P&aacute;gina no encontrada</h2>
        <p className="text-gray-600 mb-6">
          La p&aacute;gina que buscas no existe o fue movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
