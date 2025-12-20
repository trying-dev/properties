'use client'

import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'

import Header from '+/components/Header'
import CardAdmin from '../../fragments/CardAdmin'

export default function AdminAdministratorsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Administradores</h1>
            <p className="text-gray-600">Gestiona los perfiles y permisos del equipo.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/admin/create-admin')}
            className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>Agregar</span>
          </button>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="divide-y divide-gray-200">
            {new Array(5).fill(null).map((_, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <CardAdmin />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
