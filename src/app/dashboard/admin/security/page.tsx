'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, ShieldAlert } from 'lucide-react'
import { SecurityDeviceType } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { getAdminPropertiesForSelect } from '+/actions/property-tax'
import { getAdminUnitsWithProperty } from '+/actions/meters'
import {
  createSecurityDeviceAction,
  deleteSecurityDeviceAction,
  getAdminSecurityDevices,
  toggleSecurityDeviceActiveAction,
  type AdminSecurityDeviceRow,
} from '+/actions/security'

const typeLabel: Record<SecurityDeviceType, string> = {
  EXTINGUISHER: 'Extintor',
  CAMERA: 'Cámara',
  ALARM: 'Alarma',
  DETECTOR: 'Detector',
  OTHER: 'Otro',
}

const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')
const daysTo = (d: Date | string) => Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

type UnitOpt = { id: string; unitNumber: string; propertyId: string }

export default function AdminSecurityPage() {
  const [rows, setRows] = useState<AdminSecurityDeviceRow[]>([])
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [units, setUnits] = useState<UnitOpt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [type, setType] = useState<SecurityDeviceType>(SecurityDeviceType.EXTINGUISHER)
  const [location, setLocation] = useState('')
  const [brand, setBrand] = useState('')
  const [nextServiceDate, setNextServiceDate] = useState('')
  const [busy, setBusy] = useState(false)

  const loadData = async () => {
    const [list, propList, unitList] = await Promise.all([
      getAdminSecurityDevices(),
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
        console.error('Error loading devices:', err)
        setError('No se pudieron cargar los dispositivos')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unitsForProperty = useMemo(() => units.filter((u) => u.propertyId === propertyId), [units, propertyId])

  const handleCreate = async () => {
    setError(null)
    if (!propertyId) return setError('Selecciona una propiedad')
    setBusy(true)
    try {
      const result = await createSecurityDeviceAction({
        propertyId,
        unitId: unitId || undefined,
        type,
        location: location || undefined,
        brand: brand || undefined,
        nextServiceDate: nextServiceDate || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo crear')
      setShowForm(false)
      setUnitId('')
      setLocation('')
      setBrand('')
      setNextServiceDate('')
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleToggle = async (id: string, active: boolean) => {
    setBusy(true)
    try {
      await toggleSecurityDeviceActiveAction({ deviceId: id, active })
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    try {
      const result = await deleteSecurityDeviceAction({ deviceId: id })
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
          <h1 className="text-2xl font-bold text-gray-900">Seguridad</h1>
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
          Inventario de dispositivos (extintores, cámaras, alarmas, detectores). La próxima recarga/mantenimiento alimentará las alertas (F6).
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
                <select value={type} onChange={(e) => setType(e.target.value as SecurityDeviceType)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {Object.values(SecurityDeviceType).map((t) => (
                    <option key={t} value={t}>
                      {typeLabel[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Ubicación</span>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Ej. Pasillo piso 2" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Marca/modelo</span>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Próxima recarga/servicio</span>
                <input type="date" value={nextServiceDate} onChange={(e) => setNextServiceDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
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
          <p className="text-gray-500 text-sm">Aún no hay dispositivos registrados.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Propiedad</th>
                  <th className="py-3 px-4">Próx. servicio</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((d) => {
                  const days = d.nextServiceDate ? daysTo(d.nextServiceDate) : null
                  const soon = d.active && days != null && days <= 30
                  return (
                    <tr key={d.id} className="text-gray-700">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">{typeLabel[d.type]}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{[d.location, d.brand].filter(Boolean).join(' · ') || '-'}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {d.property.name}
                        {d.unit ? ` · ${d.unit.unitNumber}` : ' · General'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatDate(d.nextServiceDate)}
                        {soon && (
                          <span className="block text-xs text-orange-600 mt-1">{days! < 0 ? 'vencido' : `en ${days} d`}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {d.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleToggle(d.id, !d.active)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                            {d.active ? 'Desactivar' : 'Activar'}
                          </button>
                          <button type="button" onClick={() => handleDelete(d.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
