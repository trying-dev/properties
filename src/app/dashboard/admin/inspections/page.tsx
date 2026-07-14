'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, ClipboardCheck, Plus } from 'lucide-react'
import { InspectionCondition, InspectionStatus, InspectionType } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import {
  cancelInspectionAction,
  completeInspectionAction,
  createInspectionAction,
  getAdminInspections,
  getAdminUnitsForSelect,
  type AdminInspectionRow,
} from '+/actions/inspections'

const typeLabel: Record<InspectionType, string> = {
  ENTREGA: 'Entrega',
  RECEPCION: 'Recepción',
  PERIODICA: 'Periódica',
  DIAGNOSTICO: 'Diagnóstico',
}

const statusLabel: Record<InspectionStatus, string> = {
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Terminada',
  CANCELLED: 'Cancelada',
}

const statusStyle: Record<InspectionStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

const conditionLabel: Record<InspectionCondition, string> = {
  GOOD: 'Bueno',
  FAIR: 'Regular',
  POOR: 'Malo',
}

const formatDate = (value?: Date | string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO')
}

export default function AdminInspectionsPage() {
  const [inspections, setInspections] = useState<AdminInspectionRow[]>([])
  const [units, setUnits] = useState<{ id: string; label: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form nueva inspección
  const [showForm, setShowForm] = useState(false)
  const [unitId, setUnitId] = useState('')
  const [type, setType] = useState<InspectionType>(InspectionType.ENTREGA)
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)

  // Completar inline
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [condition, setCondition] = useState<InspectionCondition>(InspectionCondition.GOOD)
  const [score, setScore] = useState('')
  const [critical, setCritical] = useState('0')

  const loadData = async () => {
    const [rows, unitList] = await Promise.all([getAdminInspections(), getAdminUnitsForSelect()])
    setInspections(rows)
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
        console.error('Error loading inspections:', err)
        setError('No se pudieron cargar las inspecciones')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    setError(null)
    if (!unitId) {
      setError('Selecciona una unidad')
      return
    }
    setBusy(true)
    try {
      const result = await createInspectionAction({ unitId, type, scheduledDate: scheduledDate || undefined, notes: notes || undefined })
      if (!result.success) {
        setError(result.error ?? 'No se pudo crear la inspección')
        return
      }
      setShowForm(false)
      setScheduledDate('')
      setNotes('')
      await loadData()
    } catch (err) {
      console.error('Error creating inspection:', err)
      setError('No se pudo crear la inspección')
    } finally {
      setBusy(false)
    }
  }

  const startComplete = (id: string) => {
    setCompletingId(id)
    setCondition(InspectionCondition.GOOD)
    setScore('')
    setCritical('0')
  }

  const handleComplete = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await completeInspectionAction({
        inspectionId: id,
        overallCondition: condition,
        score: score ? Number(score) : undefined,
        criticalFindings: Number(critical) || 0,
      })
      if (!result.success) {
        setError(result.error ?? 'No se pudo completar')
        return
      }
      setCompletingId(null)
      await loadData()
    } catch (err) {
      console.error('Error completing inspection:', err)
      setError('No se pudo completar')
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await cancelInspectionAction({ inspectionId: id })
      if (!result.success) setError(result.error ?? 'No se pudo cancelar')
      else await loadData()
    } finally {
      setBusy(false)
    }
  }

  const scheduledCount = useMemo(
    () => inspections.filter((i) => i.status === InspectionStatus.SCHEDULED).length,
    [inspections],
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <div className="flex items-center justify-between gap-4 mb-1">
          <h1 className="text-2xl font-bold text-gray-900">Inspecciones</h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva inspección
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Diagnóstico del estado de las unidades (entrega, recepción, periódica). {scheduledCount} programada(s).
        </p>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <select value={type} onChange={(e) => setType(e.target.value as InspectionType)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {Object.values(InspectionType).map((t) => (
                    <option key={t} value={t}>
                      {typeLabel[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Fecha programada</span>
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Notas</span>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional" />
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
        ) : inspections.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no hay inspecciones.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4">Unidad</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Programada</th>
                  <th className="py-3 px-4">Realizada</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Resultado</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="text-gray-700 align-top">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">
                      {insp.unit.property.name} · {insp.unit.unitNumber}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{typeLabel[insp.type]}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(insp.scheduledDate)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(insp.performedDate)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[insp.status]}`}>
                        {statusLabel[insp.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {insp.status === InspectionStatus.COMPLETED ? (
                        <span className="inline-flex items-center gap-2">
                          {insp.overallCondition ? conditionLabel[insp.overallCondition] : '-'}
                          {insp.score != null && <span className="text-gray-500">{insp.score}%</span>}
                          {insp.criticalFindings > 0 && (
                            <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                              <AlertTriangle className="h-3 w-3" />
                              {insp.criticalFindings}
                            </span>
                          )}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {insp.status === InspectionStatus.SCHEDULED || insp.status === InspectionStatus.IN_PROGRESS ? (
                        completingId === insp.id ? (
                          <div className="flex flex-wrap items-end gap-2">
                            <label className="flex flex-col text-xs">
                              <span className="text-gray-400">Estado</span>
                              <select value={condition} onChange={(e) => setCondition(e.target.value as InspectionCondition)} className="rounded border border-gray-300 px-2 py-1">
                                {Object.values(InspectionCondition).map((c) => (
                                  <option key={c} value={c}>
                                    {conditionLabel[c]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="flex flex-col text-xs">
                              <span className="text-gray-400">%</span>
                              <input type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)} className="w-16 rounded border border-gray-300 px-2 py-1" />
                            </label>
                            <label className="flex flex-col text-xs">
                              <span className="text-gray-400">Críticos</span>
                              <input type="number" min="0" value={critical} onChange={(e) => setCritical(e.target.value)} className="w-16 rounded border border-gray-300 px-2 py-1" />
                            </label>
                            <button type="button" onClick={() => handleComplete(insp.id)} disabled={busy} className="rounded bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                              Guardar
                            </button>
                            <button type="button" onClick={() => setCompletingId(null)} className="rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600">
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button type="button" onClick={() => startComplete(insp.id)} className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-50">
                              <ClipboardCheck className="h-3 w-3" />
                              Completar
                            </button>
                            <button type="button" onClick={() => handleCancel(insp.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
                              Cancelar
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
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
