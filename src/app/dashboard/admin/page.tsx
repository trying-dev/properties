'use client'

import { useEffect, useState, useTransition } from 'react'
import { Plus, Building2, Users, Calendar, TrendingUp, LogOut, User } from 'lucide-react'

import CardAdmin from '../fragments/CardAdmin'
import CardProperty from '../fragments/CardProperty'
import { Property } from '@prisma/client'

import { getProperties } from '+/actions/property'
import { useSession } from '+/hooks/useSession'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { logout } from '+/hooks/getSession'

interface DashboardStats {
  totalProperties: number
  activeAdmins: number
  pendingTasks: number
  monthlyRevenue: number
}

export default function Dashboard() {
  const router = useRouter()
  const { session, status } = useSession()
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeAdmins: 0,
    pendingTasks: 0,
    monthlyRevenue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (status === 'loading') return

    startTransition(async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simular carga de datos en paralelo
        const [propertiesData] = await Promise.all([
          getProperties(),
          // Aquí podrías agregar más llamadas: getAdmins(), getStats(), etc.
          new Promise((resolve) => setTimeout(resolve, 650)), // Simular delay
        ])

        setProperties(propertiesData)

        // Calcular estadísticas basadas en los datos
        setStats({
          totalProperties: propertiesData.length,
          activeAdmins: 5, // Este vendría de una API real
          pendingTasks: Math.floor(Math.random() * 10) + 1,
          monthlyRevenue: Math.floor(Math.random() * 50000) + 10000,
        })
      } catch (err) {
        console.error('Error loading dashboard:', err)
        setError('Error al cargar los datos del dashboard')
      } finally {
        setIsLoading(false)
      }
    })
  }, [status])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-md"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-8 bg-gray-200 rounded w-10"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <Building2 className="w-full h-full" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error en el Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const userName = session?.user?.name || session?.user?.email || 'Usuario'
  const userRole = session?.user?.role === 'admin' ? 'Administrador' : 'Inquilino'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">¡Bienvenido, {userName}!</h1>
              <p className="text-gray-600">
                {userRole} •{' '}
                {new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {userRole}
                </div>
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {userName.split(' ')[0]}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block text-sm">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Propiedades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                <p className="text-xs text-green-600">+2 este mes</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAdmins}</p>
                <p className="text-xs text-blue-600">Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <Calendar className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
                <p className="text-xs text-yellow-600">Requieren atención</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Mes</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-xs text-green-600">+15% vs mes anterior</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Properties Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="h-6 w-6 mr-2 text-blue-600" />
                Mis Propiedades
              </h2>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                {properties.length}
              </span>
            </div>

            <div className="bg-white rounded-lg border shadow-sm">
              {properties.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades</h3>
                  <p className="text-gray-600">Aún no tienes propiedades registradas.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <div key={property.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <CardProperty property={property} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admins Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-600" />
                Equipo de Administración
              </h2>
              <button
                onClick={() => router.push('/dashboard/admin/create-admin')}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <Building2 className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Nueva Propiedad</span>
            </button>
            <Link
              href="/dashboard/admin/nuevo-proceso"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Nuevo Proceso</span>
            </Link>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors">
              <Calendar className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Programar Visita</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Ver Reportes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
