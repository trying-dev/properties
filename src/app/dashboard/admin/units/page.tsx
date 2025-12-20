'use client'

import { Building2, Layers, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

import Header from '+/components/Header'

export default function AdminUnitsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unidades</h1>
          <p className="text-gray-600">Consulta disponibilidad y administra unidades por propiedad.</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-8 text-center">
          <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestión de unidades</h2>
          <p className="text-gray-600 mb-6">
            Accede al flujo de selección de unidades o revisa las propiedades para ver sus detalles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push('/dashboard/admin/nuevo-proceso')}
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>Ver unidades disponibles</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/admin/properties')}
              className="inline-flex items-center space-x-2 border border-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:border-gray-300 transition-colors"
            >
              <Building2 className="h-5 w-5" />
              <span>Ir a propiedades</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
