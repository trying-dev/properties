'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Wrench } from 'lucide-react'
import { CostResponsibility, MaintenanceStatus, MaintenanceType } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { getAdminUnitsForSelect } from '+/actions/inspections'
import {
  cancelMaintenanceAction,
  completeMaintenanceAction,
  createMaintenanceAction,
  getAdminMaintenances,
  type AdminMaintenanceRow,
} from '+/actions/maintenance'

const typeLabel: Record<MaintenanceType, string> = {
  CORRECTIVE: 'Correctivo',
  PREVENTIVE: 'Preventivo',
  INCIDENT: 'Incidente',
}

const statusLabel: Record<MaintenanceStatus, string> = {
  PENDING: 'Pendiente',
  SCHEDULED: 'Programado',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Terminado',
  CANCELLED: 'Cancelado',
}

const statusStyle: Record<MaintenanceStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const bearerLabel: Record<CostResponsibility, string> = {
  OWNER: 'Dueño',
  TENANT: 'Inquilino',
  PROPERTIES: 'Properties',
}

const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')
const formatMoney = (value?: number | null) => (value == null ? '-' : `$${value.toLocaleString('es-CO')}`)

export default function AdminMaintenancePage() {
  const [rows, setRows] = useState<AdminMaintenanceRow[]>([])
  const [units, setUnits] = useState<{ id: string; label: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form nuevo
  const [showForm, setShowForm] = useState(false)
  const [unitId, setUnitId] = useState('')
  const [type, setType] = useState<MaintenanceType>(MaintenanceType.CORRECTIVE)
  const [costBearer, setCostBearer] = useState<CostResponsibility>(CostResponsibility.OWNER)
  const [title, setTitle] = useState('')
  const [provider, setProvider] = useState('')
  const [cost, setCost] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [busy, setBusy] = useState(false)

  // Completar inline
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [finalCost, setFinalCost] = useState('')
  const [solution, setSolution] = useState('')

  const loadData = async () => {
    const [list, unitList] = await Promise.all([getAdminMaintenances(), getAdminUnitsForSelect()])
    setRows(list)
    setUnits(unitList)
    if (!unitId && unitList.length) setUnitId(unitList[0].id)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await loadData()
      } catch (err) {
        console.error('Error loading maintenance:', err)
        setError('No se pudieron cargar los mantenimientos')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    setError(null)
    if (!unitId) return setError('Selecciona una unidad')
    if (!title.trim()) return setError('El título es obligatorio')
    setBusy(true)
    try {
      const result = await createMaintenanceAction({
        unitId,
        type,
        costBearer,
        title,
        provider: provider || undefined,
        cost: cost ? Number(cost) : undefined,
        scheduledDate: scheduledDate || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo crear')
      setShowForm(false)
      setTitle('')
      setProvider('')
      setCost('')
      setScheduledDate('')
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const startComplete = (id: string, currentCost?: number | null) => {
    setCompletingId(id)
    setFinalCost(currentCost != null ? String(currentCost) : '')
    setSolution('')
  }

  const handleComplete = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await completeMaintenanceAction({
        maintenanceId: id,
        cost: finalCost ? Number(finalCost) : undefined,
        solution: solution || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo completar')
      setCompletingId(null)
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await cancelMaintenanceAction({ maintenanceId: id })
      if (!result.success) setError(result.error ?? 'No se pudo cancelar')
      else await loadData()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <div className="flex items-center justify-between gap-4 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Mantenimiento</h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Correctivos, preventivos e incidentes. Los que asume el dueño (costo OWNER) se descuentan de su liquidación.
        </p>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Unidad</span>
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {units.length === 0 && <option value="">Sin unidades</option>}
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Tipo</span>
                <select value={type} onChange={(e) => setType(e.target.value as MaintenanceType)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {Object.values(MaintenanceType).map((t) => (
                    <option key={t} value={t}>
                      {typeLabel[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Costo lo asume</span>
                <select value={costBearer} onChange={(e) => setCostBearer(e.target.value as CostResponsibility)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {Object.values(CostResponsibility).map((c) => (
                    <option key={c} value={c}>
                      {bearerLabel[c]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm lg:col-span-2">
                <span className="text-gray-500 mb-1">Título</span>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Ej. Reparación calentador" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Proveedor</span>
                <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Costo estimado</span>
                <input type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Fecha programada</span>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={handleCreate} disabled={busy || units.length === 0} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {busy ? 'Creando…' : 'Crear'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {isLoading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no hay mantenimientos.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4">Unidad</th>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Costo asume</th>
                  <th className="py-3 px-4">Costo</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((m) => (
                  <tr key={m.id} className="text-gray-700 align-top">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">
                      {m.unit.property.name} · {m.unit.unitNumber}
                    </td>
                    <td className="py-3 px-4">{m.title}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{typeLabel[m.type]}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={m.costBearer === 'OWNER' ? 'font-semibold text-gray-900' : ''}>{bearerLabel[m.costBearer]}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatMoney(m.cost)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[m.status]}`}>
                        {statusLabel[m.status]}
                      </span>
                      {m.status === 'COMPLETED' && m.completedDate && (
                        <span className="block text-xs text-gray-400 mt-1">{formatDate(m.completedDate)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {m.status === 'COMPLETED' || m.status === 'CANCELLED' ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : completingId === m.id ? (
                        <div className="flex flex-wrap items-end gap-2">
                          <label className="flex flex-col text-xs">
                            <span className="text-gray-400">Costo real</span>
                            <input type="number" min="0" value={finalCost} onChange={(e) => setFinalCost(e.target.value)} className="w-24 rounded border border-gray-300 px-2 py-1" />
                          </label>
                          <label className="flex flex-col text-xs">
                            <span className="text-gray-400">Solución</span>
                            <input type="text" value={solution} onChange={(e) => setSolution(e.target.value)} className="w-40 rounded border border-gray-300 px-2 py-1" />
                          </label>
                          <button type="button" onClick={() => handleComplete(m.id)} disabled={busy} className="rounded bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                            Guardar
                          </button>
                          <button type="button" onClick={() => setCompletingId(null)} className="rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startComplete(m.id, m.cost)} className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-50">
                            <Wrench className="h-3 w-3" />
                            Completar
                          </button>
                          <button type="button" onClick={() => handleCancel(m.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
                            Cancelar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
