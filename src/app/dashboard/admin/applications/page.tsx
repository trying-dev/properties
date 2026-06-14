'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText, Search, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'
import type { ProcessStatus } from '@prisma/client'

import { getAdminProcessesAction } from '+/actions/processes'
import type { AdminProcess } from '+/actions/processes'
import { processStatusConfig } from '+/lib/processStatus'
import Header from '+/components/Header'

const formatDate = (value?: string | Date | null) => {
  if (!value) return '-'
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString('es-CO')
}

// Estados que devuelve getAdminProcessesAction (activos).
const filterStatuses: ProcessStatus[] = ['IN_PROGRESS', 'IN_EVALUATION', 'WAITING_FOR_FEEDBACK']

const tenantName = (p: AdminProcess) =>
  [p.tenant?.user?.name, p.tenant?.user?.lastName].filter(Boolean).join(' ') || p.tenant?.user?.email || 'Solicitud sin nombre'

export default function AdminApplicationsPage() {
  const [processes, setProcesses] = useState<AdminProcess[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProcessStatus | 'ALL'>('ALL')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      const result = await getAdminProcessesAction()
      if (!result.success || !result.data) {
        setError(result.error ?? 'No se pudieron cargar las aplicaciones.')
        setLoading(false)
        return
      }
      setProcesses(result.data)
      setLoading(false)
    }
    void load()
  }, [])

  const counts = useMemo(() => {
    const base: Record<ProcessStatus, number> = {
      IN_PROGRESS: 0,
      IN_EVALUATION: 0,
      WAITING_FOR_FEEDBACK: 0,
      APPROVED: 0,
      DISAPPROVED: 0,
    }
    for (const p of processes) base[p.status] += 1
    return base
  }, [processes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processes.filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false
      if (!q) return true
      const haystack = [
        tenantName(p),
        p.tenant?.user?.email ?? '',
        p.unit?.property?.name ?? '',
        p.unit?.unitNumber ?? '',
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [processes, query, statusFilter])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Aplicaciones</h1>
            <p className="text-gray-600">Gestiona los procesos de solicitud activos.</p>
          </div>
          <Link
            href="/dashboard/admin/nuevo-proceso"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo proceso
          </Link>
        </div>

        {/* Resumen por estado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {filterStatuses.map((status) => {
            const cfg = processStatusConfig[status]
            const active = statusFilter === status
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(active ? 'ALL' : status)}
                className={`rounded-lg border p-5 text-left transition-all ${
                  active ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cfg.box}`}>
                  {cfg.label}
                </span>
                <p className="mt-3 text-3xl font-bold text-gray-900">{loading ? '—' : counts[status]}</p>
              </button>
            )
          })}
        </div>

        {/* Búsqueda + filtro */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por inquilino, email, propiedad o unidad..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>
          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Quitar filtro
            </button>
          )}
        </div>

        {/* Lista */}
        <div className="rounded-lg border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Aplicaciones</h2>
            <span className="text-sm text-gray-500">{loading ? 'Cargando...' : `${filtered.length} resultado(s)`}</span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-5 text-sm text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <FileText className="h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-600">
                {processes.length === 0 ? 'No hay aplicaciones activas por ahora.' : 'Ninguna aplicación coincide con la búsqueda.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const cfg = processStatusConfig[p.status]
                const unitLabel = p.unit?.unitNumber ? `Unidad ${p.unit.unitNumber}` : 'Unidad'
                const propertyName = p.unit?.property?.name ?? 'Propiedad'
                return (
                  <li key={p.id}>
                    <Link
                      href={`/dashboard/admin/applications/${p.id}`}
                      className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{tenantName(p)}</p>
                        <p className="truncate text-xs text-gray-500">
                          {propertyName} · {unitLabel}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="hidden sm:inline rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          Paso {p.currentStep}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cfg.box}`}>
                          {cfg.label}
                        </span>
                        <span className="hidden md:inline text-xs text-gray-500">{formatDate(p.updatedAt)}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
