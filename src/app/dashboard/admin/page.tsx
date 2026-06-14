'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, CreditCard, FilePlus, FileText, Layers, MessageCircle, UserCog, Users } from 'lucide-react'

import { getProperties } from '+/actions/property'
import { getPendingPaymentsCount } from '+/actions/payments'
import { getPendingApplicationsCount } from '+/actions/processes'
import Header from '+/components/Header'
import OccupancyOverview from './_/OccupancyOverview'

type MenuOption = {
  id: string
  title: string
  description: string
  icon: typeof Building2
  href: string
  badge: number | null
  hasBadge: boolean
}

export default function AdminDashboard() {
  const router = useRouter()
  const [propertiesCount, setPropertiesCount] = useState<number | null>(null)
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState<number | null>(null)
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const [properties, payments, applications] = await Promise.allSettled([
        getProperties(),
        getPendingPaymentsCount(),
        getPendingApplicationsCount(),
      ])
      if (!mounted) return
      if (properties.status === 'fulfilled') setPropertiesCount(properties.value.length)
      if (payments.status === 'fulfilled') setPendingPaymentsCount(payments.value)
      if (applications.status === 'fulfilled') setPendingApplicationsCount(applications.value)
      setLoading(false)
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const menuOptions: MenuOption[] = [
    {
      id: 'properties',
      icon: Building2,
      title: 'Propiedades',
      description: 'Gestiona el portafolio de inmuebles',
      href: '/dashboard/admin/properties',
      badge: propertiesCount,
      hasBadge: true,
    },
    {
      id: 'units',
      icon: Layers,
      title: 'Unidades',
      description: 'Revisa la disponibilidad de unidades',
      href: '/dashboard/admin/units',
      badge: null,
      hasBadge: false,
    },
    {
      id: 'applications',
      icon: FileText,
      title: 'Aplicaciones',
      description: 'Procesos y solicitudes activas',
      href: '/dashboard/admin/applications',
      badge: pendingApplicationsCount,
      hasBadge: true,
    },
    {
      id: 'new-process',
      icon: FilePlus,
      title: 'Nuevo proceso',
      description: 'Inicia una solicitud para un inquilino',
      href: '/dashboard/admin/nuevo-proceso',
      badge: null,
      hasBadge: false,
    },
    {
      id: 'tenants',
      icon: Users,
      title: 'Inquilinos',
      description: 'Gestiona y consulta los inquilinos',
      href: '/dashboard/admin/gestion-de-inquilinos',
      badge: null,
      hasBadge: false,
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Pagos',
      description: 'Confirma pagos manuales y revisa el historial',
      href: '/dashboard/admin/payments',
      badge: pendingPaymentsCount,
      hasBadge: true,
    },
    {
      id: 'administrators',
      icon: UserCog,
      title: 'Administradores',
      description: 'Gestiona tu equipo de administración',
      href: '/dashboard/admin/administrators',
      badge: null,
      hasBadge: false,
    },
    {
      id: 'notifications',
      icon: MessageCircle,
      title: 'Notificaciones',
      description: 'Alertas y comunicaciones del sistema',
      href: '/dashboard/admin/notifications',
      badge: null,
      hasBadge: false,
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

        <OccupancyOverview />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => router.push(option.href)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <option.icon className="h-8 w-8 text-gray-900" strokeWidth={1.5} />
                </div>
                {option.hasBadge &&
                  (option.badge !== null ? (
                    <span className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{option.badge}</span>
                  ) : loading ? (
                    <span className="h-6 w-8 rounded-full bg-gray-100 animate-pulse" />
                  ) : null)}
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
