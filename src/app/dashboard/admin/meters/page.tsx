'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Gauge, Plus } from 'lucide-react'
import { MeterType } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { getAdminPropertiesForSelect } from '+/actions/property-tax'
import {
  addMeterReadingAction,
  createMeterAction,
  deleteMeterAction,
  getAdminMeters,
  getAdminUnitsWithProperty,
  toggleMeterActiveAction,
  type AdminMeterRow,
} from '+/actions/meters'

const typeLabel: Record<MeterType, string> = {
  WATER: 'Agua',
  ELECTRICITY: 'Luz',
  GAS: 'Gas',
  OTHER: 'Otro',
}

const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')
const formatNum = (value?: number | null) => (value == null ? '-' : value.toLocaleString('es-CO'))

type UnitOpt = { id: string; unitNumber: string; propertyId: string }

export default function AdminMetersPage() {
  const [rows, setRows] = useState<AdminMeterRow[]>([])
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [units, setUnits] = useState<UnitOpt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form nuevo medidor
  const [showForm, setShowForm] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [type, setType] = useState<MeterType>(MeterType.WATER)
  const [serial, setSerial] = useState('')
  const [provider, setProvider] = useState('')
  const [unitOfMeasure, setUnitOfMeasure] = useState('')
  const [busy, setBusy] = useState(false)

  // Lecturas inline
  const [openMeterId, setOpenMeterId] = useState<string | null>(null)
  const [readingValue, setReadingValue] = useState('')
  const [readingDate, setReadingDate] = useState('')

  const loadData = async () => {
    const [list, propList, unitList] = await Promise.all([
      getAdminMeters(),
      getAdminPropertiesForSelect(),
      getAdminUnitsWithProperty(),
    ])
    setRows(list)
    setProperties(propList)
    setUnits(unitList)
    if (!propertyId && propList.length) setPropertyId(propList[0].id)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await loadData()
      } catch (err) {
        console.error('Error loading meters:', err)
        setError('No se pudieron cargar los medidores')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Unidades de la propiedad seleccionada (medidor de unidad opcional).
  const unitsForProperty = useMemo(() => units.filter((u) => u.propertyId === propertyId), [units, propertyId])

  const handleCreate = async () => {
    setError(null)
    if (!propertyId) return setError('Selecciona una propiedad')
    setBusy(true)
    try {
      const result = await createMeterAction({
        propertyId,
        unitId: unitId || undefined,
        type,
        serial: serial || undefined,
        provider: provider || undefined,
        unitOfMeasure: unitOfMeasure || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo crear')
      setShowForm(false)
      setUnitId('')
      setSerial('')
      setProvider('')
      setUnitOfMeasure('')
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleAddReading = async (meterId: string) => {
    setError(null)
    if (!readingValue || Number(readingValue) < 0) return setError('Lectura inválida')
    setBusy(true)
    try {
      const result = await addMeterReadingAction({
        meterId,
        value: Number(readingValue),
        readingDate: readingDate || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo registrar')
      setReadingValue('')
      setReadingDate('')
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleToggle = async (meterId: string, active: boolean) => {
    setBusy(true)
    try {
      await toggleMeterActiveAction({ meterId, active })
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (meterId: string) => {
    setBusy(true)
    try {
      const result = await deleteMeterAction({ meterId })
      if (!result.success) setError(result.error ?? 'No se pudo eliminar')
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
          <h1 className="text-2xl font-bold text-gray-900">Medidores</h1>
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
          Medidores de servicios (agua/luz/gas) y su historial de lecturas. El consumo se calcula contra la lectura anterior.
        </p>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Propiedad</span>
                <select
                  value={propertyId}
                  onChange={(e) => {
                    setPropertyId(e.target.value)
                    setUnitId('')
                  }}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                >
                  {properties.length === 0 && <option value="">Sin propiedades</option>}
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Unidad (opcional)</span>
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
                  <option value="">General / zona común</option>
                  {unitsForProperty.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Tipo</span>
                <select value={type} onChange={(e) => setType(e.target.value as MeterType)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {Object.values(MeterType).map((t) => (
                    <option key={t} value={t}>
                      {typeLabel[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Serial</span>
                <input type="text" value={serial} onChange={(e) => setSerial(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Empresa</span>
                <input type="text" value={provider} onChange={(e) => setProvider(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Ej. Codensa" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Unidad de medida</span>
                <input type="text" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Ej. m³, kWh" />
              </label>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={handleCreate} disabled={busy || properties.length === 0} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
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
          <p className="text-gray-500 text-sm">Aún no hay medidores.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((m) => {
              const last = m.readings[0]
              const isOpen = openMeterId === m.id
              return (
                <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {typeLabel[m.type]} · {m.property.name}
                        {m.unit ? ` · ${m.unit.unitNumber}` : ' · General'}
                        {!m.active && <span className="ml-2 text-xs text-gray-400">(inactivo)</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {[m.provider, m.serial && `S/N ${m.serial}`, m.unitOfMeasure].filter(Boolean).join(' · ') || 'Sin datos adicionales'}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-500 text-xs">Última lectura</p>
                      <p className="font-semibold text-gray-900">
                        {last ? `${formatNum(last.value)} ${m.unitOfMeasure ?? ''}` : '—'}
                      </p>
                      {last && <p className="text-xs text-gray-400">{formatDate(last.readingDate)}</p>}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setOpenMeterId(isOpen ? null : m.id)} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                      <Gauge className="h-3 w-3" />
                      {isOpen ? 'Cerrar' : 'Lecturas'}
                    </button>
                    <button type="button" onClick={() => handleToggle(m.id, !m.active)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                      {m.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button" onClick={() => handleDelete(m.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
                      Eliminar
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex flex-wrap items-end gap-2 mb-3">
                        <label className="flex flex-col text-xs">
                          <span className="text-gray-400">Nueva lectura</span>
                          <input type="number" min="0" value={readingValue} onChange={(e) => setReadingValue(e.target.value)} className="w-32 rounded border border-gray-300 px-2 py-1" />
                        </label>
                        <label className="flex flex-col text-xs">
                          <span className="text-gray-400">Fecha</span>
                          <input type="date" value={readingDate} onChange={(e) => setReadingDate(e.target.value)} className="rounded border border-gray-300 px-2 py-1" />
                        </label>
                        <button type="button" onClick={() => handleAddReading(m.id)} disabled={busy} className="rounded bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                          Registrar
                        </button>
                      </div>

                      {m.readings.length === 0 ? (
                        <p className="text-xs text-gray-400">Sin lecturas.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-gray-400 border-b border-gray-100">
                                <th className="py-1.5 pr-4">Fecha</th>
                                <th className="py-1.5 pr-4">Lectura</th>
                                <th className="py-1.5 pr-4">Consumo</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {m.readings.map((r) => (
                                <tr key={r.id} className="text-gray-700">
                                  <td className="py-1.5 pr-4 whitespace-nowrap">{formatDate(r.readingDate)}</td>
                                  <td className="py-1.5 pr-4 whitespace-nowrap">{formatNum(r.value)}</td>
                                  <td className="py-1.5 pr-4 whitespace-nowrap">{r.consumption == null ? '—' : formatNum(r.consumption)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
