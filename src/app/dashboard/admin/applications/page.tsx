'use client'

import { useEffect, useState, useTransition } from 'react'
import { Building2, Calendar, TrendingUp, Users, FileText } from 'lucide-react'
import Link from 'next/link'

import { getProperties } from '+/actions/property'
import { getAdminProcessesAction } from '+/actions/processes'
import Header from '+/components/Header'

interface DashboardStats {
  totalProperties: number
  activeAdmins: number
  pendingTasks: number
  monthlyRevenue: number
}

type AdminProcess = {
  id: string
  status: 'OPEN' | 'IN_PROGRESS'
  currentStep: number
  updatedAt: string
  createdAt: string
  tenant: {
    id: string
    user: { name: string | null; lastName: string | null; email: string | null }
  } | null
  unit: {
    id: string
    unitNumber: string
    property: { name: string }
  } | null
}

export default function AdminApplicationsPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeAdmins: 0,
    pendingTasks: 0,
    monthlyRevenue: 0,
  })
  const [processes, setProcesses] = useState<AdminProcess[]>([])
  const [processesError, setProcessesError] = useState<string | null>(null)
  const [processesLoading, setProcessesLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [propertiesData] = await Promise.all([
          getProperties(),
          new Promise((resolve) => setTimeout(resolve, 450)),
        ])

        setStats({
          totalProperties: propertiesData.length,
          activeAdmins: 5,
          pendingTasks: Math.floor(Math.random() * 10) + 1,
          monthlyRevenue: Math.floor(Math.random() * 50000) + 10000,
        })
      } catch (err) {
        console.error('Error loading applications stats:', err)
        setError('Error al cargar el resumen de aplicaciones')
      } finally {
        setIsLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    const loadProcesses = async () => {
      setProcessesLoading(true)
      setProcessesError(null)
      const result = await getAdminProcessesAction()
      if (!result.success || !result.data) {
        setProcessesError(result.error ?? 'No se pudieron cargar las aplicaciones.')
        setProcessesLoading(false)
        return
      }
      setProcesses(result.data as AdminProcess[])
      setProcessesLoading(false)
    }

    void loadProcesses()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando aplicaciones...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <FileText className="w-full h-full" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar aplicaciones</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aplicaciones</h1>
          <p className="text-gray-600">Gestiona procesos y revisa el estado general.</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Aplicaciones en progreso</h2>
            <span className="text-sm text-gray-500">
              {processesLoading ? 'Cargando...' : `${processes.length} activas`}
            </span>
          </div>

          {processesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : processesError ? (
            <div className="text-sm text-red-600">{processesError}</div>
          ) : processes.length === 0 ? (
            <div className="text-sm text-gray-600">No hay aplicaciones en progreso por ahora.</div>
          ) : (
            <div className="space-y-3">
              {processes.map((process) => {
                const tenantName = [process.tenant?.user?.name, process.tenant?.user?.lastName]
                  .filter(Boolean)
                  .join(' ')
                const unitLabel = process.unit?.unitNumber ? `Unidad ${process.unit.unitNumber}` : 'Unidad'
                const propertyName = process.unit?.property?.name ?? 'Propiedad'

                return (
                  <div
                    key={process.id}
                    className="flex flex-col gap-2 rounded-lg border border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {tenantName || process.tenant?.user?.email || 'Solicitud sin nombre'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {propertyName} · {unitLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/admin/applications/${process.id}`}
                        className="text-xs font-semibold text-gray-700 hover:text-gray-900 underline"
                      >
                        Ver detalle
                      </Link>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        Paso {process.currentStep}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {process.status === 'OPEN' ? 'Abierto' : 'En progreso'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(process.updatedAt).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Propiedades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
                <p className="text-xs text-green-600">+2 este mes</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAdmins}</p>
                <p className="text-xs text-blue-600">Activos</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTasks}</p>
                <p className="text-xs text-yellow-600">Requieren atención</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Mes</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-xs text-green-600">+15% vs mes anterior</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <Building2 className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Nueva Propiedad</span>
            </button>
            <Link
              href="/dashboard/admin/nuevo-proceso"
              className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Nuevo Proceso</span>
            </Link>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <Calendar className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Programar Visita</span>
            </button>
            <button className="flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Ver Reportes</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
