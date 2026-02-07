'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CreditCard, FileText, Layers, Users } from 'lucide-react'

import { getProperties } from '+/actions/property'
import { getPendingPaymentsCount } from '+/actions/payments'
import Header from '+/components/Header'

type MenuOption = {
  id: string
  title: string
  description: string
  icon: typeof Building2
  onClick: () => void
  badge: number | null
}

export default function AdminDashboard() {
  const router = useRouter()
  const [propertiesCount, setPropertiesCount] = useState<number | null>(null)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number | null>(null)

  useEffect(() => {
    const loadPropertiesCount = async () => {
      try {
        const properties = await getProperties()
        setPropertiesCount(properties.length)
      } catch (error) {
        console.error('Error loading properties:', error)
      }
    }

    loadPropertiesCount()
  }, [])

  useEffect(() => {
    const loadPendingPaymentsCount = async () => {
      try {
        const count = await getPendingPaymentsCount()
        setPendingPaymentsCount(count)
      } catch (error) {
        console.error('Error loading pending payments count:', error)
      }
    }

    loadPendingPaymentsCount()
  }, [])

  const menuOptions: MenuOption[] = [
    {
      id: 'properties',
      icon: Building2,
      title: 'Propiedades',
      description: 'Gestiona el portafolio de inmuebles',
      onClick: () => router.push('/dashboard/admin/properties'),
      badge: propertiesCount,
    },
    {
      id: 'units',
      icon: Layers,
      title: 'Unidades',
      description: 'Revisa la disponibilidad de unidades',
      onClick: () => router.push('/dashboard/admin/units'),
      badge: null,
    },
    {
      id: 'administrators',
      icon: Users,
      title: 'Administradores',
      description: 'Gestiona tu equipo de administración',
      onClick: () => router.push('/dashboard/admin/administrators'),
      badge: null,
    },
    {
      id: 'applications',
      icon: FileText,
      title: 'Aplicaciones',
      description: 'Procesos y solicitudes activas',
      onClick: () => router.push('/dashboard/admin/applications'),
      badge: null,
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Pagos',
      description: 'Confirma pagos manuales y revisa el historial',
      onClick: () => router.push('/dashboard/admin/payments'),
      badge: pendingPaymentsCount,
    },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel de administración</h1>
          <p className="text-gray-600">Accede rápido a las áreas principales del dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <option.icon className="h-8 w-8 text-gray-900" strokeWidth={1.5} />
                </div>
                {option.badge !== null && (
                  <span className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{option.badge}</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700">{option.title}</h3>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
