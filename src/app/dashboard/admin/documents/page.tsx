'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Plus } from 'lucide-react'
import { PropertyDocumentType } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { getAdminPropertiesForSelect } from '+/actions/property-tax'
import { getAdminUnitsWithProperty } from '+/actions/meters'
import {
  createDocumentAction,
  deleteDocumentAction,
  getAdminDocuments,
  type AdminDocumentRow,
} from '+/actions/documents'

const typeLabel: Record<PropertyDocumentType, string> = {
  DEED: 'Escritura',
  TRADITION_CERT: 'Cert. tradición',
  TAX_RECEIPT: 'Recibo/predial',
  POLICY: 'Póliza',
  FLOOR_PLAN: 'Plano',
  OTHER: 'Otro',
}

const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')
const daysTo = (d: Date | string) => Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

type UnitOpt = { id: string; unitNumber: string; propertyId: string }

export default function AdminDocumentsPage() {
  const [rows, setRows] = useState<AdminDocumentRow[]>([])
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [units, setUnits] = useState<UnitOpt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showForm, setShowForm] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [type, setType] = useState<PropertyDocumentType>(PropertyDocumentType.DEED)
  const [name, setName] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [issuedDate, setIssuedDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [busy, setBusy] = useState(false)

  const loadData = async () => {
    const [list, propList, unitList] = await Promise.all([
      getAdminDocuments(),
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
        console.error('Error loading documents:', err)
        setError('No se pudieron cargar los documentos')
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
    if (!name.trim()) return setError('El nombre es obligatorio')
    setBusy(true)
    try {
      const result = await createDocumentAction({
        propertyId,
        unitId: unitId || undefined,
        type,
        name,
        fileUrl: fileUrl || undefined,
        issuedDate: issuedDate || undefined,
        expiryDate: expiryDate || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo crear')
      setShowForm(false)
      setName('')
      setFileUrl('')
      setIssuedDate('')
      setExpiryDate('')
      setUnitId('')
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    try {
      const result = await deleteDocumentAction({ documentId: id })
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
          <h1 className="text-2xl font-bold text-gray-900">Documentación</h1>
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
          Documentos legales del inmueble (escritura, certificado de tradición, recibos, pólizas). El archivo se guarda como URL; el vencimiento alimentará las alertas (F6).
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
                  <option value="">Toda la propiedad</option>
                  {unitsForProperty.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitNumber}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Tipo</span>
                <select value={type} onChange={(e) => setType(e.target.value as PropertyDocumentType)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {Object.values(PropertyDocumentType).map((t) => (
                    <option key={t} value={t}>
                      {typeLabel[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm lg:col-span-2">
                <span className="text-gray-500 mb-1">Nombre</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Ej. Escritura 1234 Notaría 5" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">URL del archivo</span>
                <input type="url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="https://…" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Expedición</span>
                <input type="date" value={issuedDate} onChange={(e) => setIssuedDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Vencimiento</span>
                <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
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
          <p className="text-gray-500 text-sm">Aún no hay documentos registrados.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Propiedad</th>
                  <th className="py-3 px-4">Vence</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((d) => {
                  const days = d.expiryDate ? daysTo(d.expiryDate) : null
                  const soon = days != null && days <= 30
                  return (
                    <tr key={d.id} className="text-gray-700">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">{typeLabel[d.type]}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1">
                          {d.name}
                          {d.fileUrl && (
                            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {d.property.name}
                        {d.unit ? ` · ${d.unit.unitNumber}` : ''}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatDate(d.expiryDate)}
                        {soon && (
                          <span className="block text-xs text-orange-600 mt-1">{days! < 0 ? 'vencido' : `en ${days} d`}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button type="button" onClick={() => handleDelete(d.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
                          Eliminar
                        </button>
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
