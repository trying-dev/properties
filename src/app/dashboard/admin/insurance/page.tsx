'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, ShieldCheck } from 'lucide-react'
import { PolicyStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import { getAdminPropertiesForSelect } from '+/actions/property-tax'
import {
  createInsurancePolicyAction,
  deleteInsurancePolicyAction,
  getAdminPolicies,
  updatePolicyStatusAction,
  type AdminPolicyRow,
} from '+/actions/insurance'

const statusLabel: Record<PolicyStatus, string> = {
  ACTIVE: 'Vigente',
  EXPIRED: 'Vencida',
  CANCELLED: 'Cancelada',
}

const statusStyle: Record<PolicyStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  EXPIRED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

const formatDate = (value?: Date | string | null) => (value ? new Date(value).toLocaleDateString('es-CO') : '-')
const formatMoney = (value?: number | null) => (value == null ? '-' : `$${value.toLocaleString('es-CO')}`)

const daysToExpiry = (endDate: Date | string) =>
  Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

export default function AdminInsurancePage() {
  const [rows, setRows] = useState<AdminPolicyRow[]>([])
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form nuevo
  const [showForm, setShowForm] = useState(false)
  const [propertyId, setPropertyId] = useState('')
  const [insurer, setInsurer] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [coverage, setCoverage] = useState('')
  const [amount, setAmount] = useState('')
  const [premium, setPremium] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [busy, setBusy] = useState(false)

  const loadData = async () => {
    const [list, propList] = await Promise.all([getAdminPolicies(), getAdminPropertiesForSelect()])
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
        console.error('Error loading policies:', err)
        setError('No se pudieron cargar las pólizas')
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
    if (!insurer.trim() || !policyNumber.trim()) return setError('Aseguradora y número son obligatorios')
    if (!startDate || !endDate) return setError('Fechas de vigencia obligatorias')
    setBusy(true)
    try {
      const result = await createInsurancePolicyAction({
        propertyId,
        insurer,
        policyNumber,
        coverage: coverage || undefined,
        amount: amount ? Number(amount) : undefined,
        premium: premium ? Number(premium) : undefined,
        startDate,
        endDate,
      })
      if (!result.success) return setError(result.error ?? 'No se pudo crear')
      setShowForm(false)
      setInsurer('')
      setPolicyNumber('')
      setCoverage('')
      setAmount('')
      setPremium('')
      setStartDate('')
      setEndDate('')
      await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleStatus = async (id: string, status: PolicyStatus) => {
    setBusy(true)
    setError(null)
    try {
      const result = await updatePolicyStatusAction({ policyId: id, status })
      if (!result.success) setError(result.error ?? 'No se pudo actualizar')
      else await loadData()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    setError(null)
    try {
      const result = await deleteInsurancePolicyAction({ policyId: id })
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
          <h1 className="text-2xl font-bold text-gray-900">Pólizas de seguro</h1>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nueva
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Seguros del inmueble. El fin de vigencia alimentará las alertas de vencimiento (F6).
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
                <span className="text-gray-500 mb-1">Aseguradora</span>
                <input type="text" value={insurer} onChange={(e) => setInsurer(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Ej. Sura" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Nº de póliza</span>
                <input type="text" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="flex flex-col text-sm lg:col-span-2">
                <span className="text-gray-500 mb-1">Cobertura</span>
                <input type="text" value={coverage} onChange={(e) => setCoverage(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional (ej. todo riesgo)" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Valor asegurado</span>
                <input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Prima</span>
                <input type="number" min="0" value={premium} onChange={(e) => setPremium(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" placeholder="Opcional" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Inicio vigencia</span>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
              </label>
              <label className="flex flex-col text-sm">
                <span className="text-gray-500 mb-1">Fin vigencia</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2" />
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
          <p className="text-gray-500 text-sm">Aún no hay pólizas registradas.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4">Propiedad</th>
                  <th className="py-3 px-4">Aseguradora</th>
                  <th className="py-3 px-4">Nº</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Vence</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((p) => {
                  const days = daysToExpiry(p.endDate)
                  const expiringSoon = p.status === 'ACTIVE' && days <= 30
                  return (
                    <tr key={p.id} className="text-gray-700 align-top">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">{p.property.name}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{p.insurer}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{p.policyNumber}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{formatMoney(p.amount)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {formatDate(p.endDate)}
                        {expiringSoon && (
                          <span className="block text-xs text-orange-600 mt-1">
                            {days < 0 ? 'vencida' : `en ${days} d`}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle[p.status]}`}>
                          {statusLabel[p.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {p.status === 'ACTIVE' && (
                            <button type="button" onClick={() => handleStatus(p.id, PolicyStatus.EXPIRED)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50">
                              Marcar vencida
                            </button>
                          )}
                          <button type="button" onClick={() => handleDelete(p.id)} disabled={busy} className="rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">
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
