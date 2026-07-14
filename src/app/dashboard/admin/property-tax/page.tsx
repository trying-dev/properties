'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Receipt } from 'lucide-react'
import { TaxStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import {
  createPropertyTaxAction,
  deletePropertyTaxAction,
  getAdminPropertiesForSelect,
  getAdminPropertyTaxes,
  markTaxPaidAction,
  type AdminPropertyTaxRow,
} from '+/actions/property-tax'

const statusLabel: Record<TaxStatus, string> = {
  PENDING: 'Sin pagar',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
}

const statusStyle: Record<TaxStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
}

const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')
const formatMoney = (value?: number | null) => (value == null ? '-' : `$${value.toLocaleString('es-CO')}`)

export default function AdminPropertyTaxPage() {
  const [rows, setRows] = useState<AdminPropertyTaxRow[]>([])
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form nuevo
  const [showForm, setShowForm] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [busy, setBusy] = useState(false)

  // Marcar pagado inline
  const [payingId, setPayingId] = useState<string | null>(null)
  const [paidDate, setPaidDate] = useState('')
  const [reference, setReference] = useState('')

  const loadData = async () => {
    const [list, propList] = await Promise.all([getAdminPropertyTaxes(), getAdminPropertiesForSelect()])
    setRows(list)
    setProperties(propList)
    if (!propertyId && propList.length) setPropertyId(propList[0].id)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await loadData()
      } catch (err) {
        console.error('Error loading property taxes:', err)
        setError('No se pudo cargar el predial')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = async () => {
    setError(null)
    if (!propertyId) return setError('Selecciona una propiedad')
    if (!amount || Number(amount) <= 0) return setError('El valor debe ser mayor a 0')
    setBusy(true)
    try {
      const result = await createPropertyTaxAction({
        propertyId,
        year: Number(year),
        amount: Number(amount),
        dueDate: dueDate || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo crear')
      setShowForm(false)
      setAmount('')
      setDueDate('')
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const startPay = (id: string) => {
    setPayingId(id)
    setPaidDate('')
    setReference('')
  }

  const handlePay = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await markTaxPaidAction({
        taxId: id,
        paidDate: paidDate || undefined,
        reference: reference || undefined,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo marcar pagado')
      setPayingId(null)
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await deletePropertyTaxAction({ taxId: id })
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
          <h1 className="text-2xl font-bold text-gray-900">Predial</h1>
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
          Impuesto predial anual por propiedad. Al marcarlo pagado, su costo se descuenta de la liquidación del dueño en el mes de la fecha de pago.
        </p>

        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="flex flex-col text-sm lg:col-span-2">
                <span className="text-gray-500 mb-1">Propiedad</span>
                <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2">
                  {properties.length === 0 && <option value="">Sin propiedades</option>}
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Año gravable</span>
                <input type="number" min="2000" value={year} onChange={(e) => setYear(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Valor</span>
                <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Ej. 1200000" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Fecha límite</span>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
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
          <p className="text-gray-500 text-sm">Aún no hay predial registrado.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4">Propiedad</th>
                  <th className="py-3 px-4">Año</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Vence</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((t) => (
                  <tr key={t.id} className="text-gray-700 align-top">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">{t.property.name}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{t.year}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatMoney(t.amount)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(t.dueDate)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[t.status]}`}>
                        {statusLabel[t.status]}
                      </span>
                      {t.status === 'PAID' && t.paidDate && (
                        <span className="block text-xs text-gray-400 mt-1">{formatDate(t.paidDate)}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {t.status === 'PAID' ? (
                        <button type="button" onClick={() => handleDelete(t.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
                          Eliminar
                        </button>
                      ) : payingId === t.id ? (
                        <div className="flex flex-wrap items-end gap-2">
                          <label className="flex flex-col text-xs">
                            <span className="text-gray-400">Fecha pago</span>
                            <input type="date" value={paidDate} onChange={(e) => setPaidDate(e.target.value)} className="rounded border border-gray-300 px-2 py-1" />
                          </label>
                          <label className="flex flex-col text-xs">
                            <span className="text-gray-400">Comprobante</span>
                            <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} className="w-32 rounded border border-gray-300 px-2 py-1" />
                          </label>
                          <button type="button" onClick={() => handlePay(t.id)} disabled={busy} className="rounded bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                            Guardar
                          </button>
                          <button type="button" onClick={() => setPayingId(null)} className="rounded border border-gray-300 px-2.5 py-1.5 text-xs text-gray-600">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button type="button" onClick={() => startPay(t.id)} className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-50">
                            <Receipt className="h-3 w-3" />
                            Marcar pagado
                          </button>
                          <button type="button" onClick={() => handleDelete(t.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
                            Eliminar
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
