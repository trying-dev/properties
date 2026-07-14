'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator, CheckCircle2 } from 'lucide-react'
import { PayoutStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import {
  generateOwnerPayoutsForPeriod,
  getAllPayouts,
  getPropertiesWithOwners,
  markPayoutPaidAction,
  type AdminPayoutRow,
} from '+/actions/payouts'

const formatMoney = (value?: number | null) => {
  if (value == null) return '-'
  return `$${value.toLocaleString('es-CO')}`
}

const formatPeriod = (period: string) => {
  const match = /^(\d{4})-(\d{2})$/.exec(period)
  if (!match) return period
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1))
  return date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}

const ownerName = (payout: AdminPayoutRow) => {
  const user = payout.owner.user
  return `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || 'Sin nombre'
}

const payoutStatusLabel: Record<PayoutStatus, string> = {
  PENDING: 'Por pagar',
  PAID: 'Pagado',
  ON_HOLD: 'Retenido',
}

const payoutStatusStyle: Record<PayoutStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  ON_HOLD: 'bg-gray-100 text-gray-600',
}

const currentPeriod = () => {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

export default function AdminPayoutsPage() {
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([])
  const [payouts, setPayouts] = useState<AdminPayoutRow[]>([])
  const [propertyId, setPropertyId] = useState('')
  const [period, setPeriod] = useState(currentPeriod())
  const [isLoading, setIsLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    const [props, rows] = await Promise.all([getPropertiesWithOwners(), getAllPayouts()])
    setProperties(props)
    setPayouts(rows)
    if (!propertyId && props.length) setPropertyId(props[0].id)
  }

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        await loadData()
      } catch (err) {
        console.error('Error loading payouts:', err)
        setError('No se pudieron cargar las liquidaciones')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = async () => {
    setError(null)
    setMessage(null)
    if (!propertyId) {
      setError('Selecciona una propiedad')
      return
    }
    if (!/^\d{4}-\d{2}$/.test(period)) {
      setError('Periodo inválido (usa AAAA-MM)')
      return
    }
    setBusy(true)
    try {
      const result = await generateOwnerPayoutsForPeriod(propertyId, period)
      if (!result.success) {
        setError(result.error ?? 'No se pudo generar la liquidación')
        return
      }
      setMessage(`Liquidación generada: ${result.data?.length ?? 0} dueño(s) para ${formatPeriod(period)}.`)
      await loadData()
    } catch (err) {
      console.error('Error generating payout:', err)
      setError('No se pudo generar la liquidación')
    } finally {
      setBusy(false)
    }
  }

  const handleMarkPaid = async (payoutId: string) => {
    setMarkingId(payoutId)
    setError(null)
    try {
      const result = await markPayoutPaidAction({ payoutId })
      if (!result.success) {
        setError(result.error ?? 'No se pudo marcar como pagado')
        return
      }
      await loadData()
    } catch (err) {
      console.error('Error marking payout paid:', err)
      setError('No se pudo marcar como pagado')
    } finally {
      setMarkingId(null)
    }
  }

  const totalPending = useMemo(
    () => payouts.filter((p) => p.status !== PayoutStatus.PAID).reduce((sum, p) => sum + p.netAmount, 0),
    [payouts],
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Link
          href="/dashboard/admin"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Liquidaciones a dueños</h1>
        <p className="text-sm text-gray-500 mb-6">
          Genera la liquidación mensual de una propiedad (canon confirmado − comisión, repartido por participación) y
          registra los pagos a cada dueño.
        </p>

        {/* Generador */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col text-sm">
              <span className="text-gray-500 mb-1">Propiedad</span>
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 min-w-56"
              >
                {properties.length === 0 && <option value="">Sin propiedades con dueños</option>}
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col text-sm">
              <span className="text-gray-500 mb-1">Periodo</span>
              <input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={busy || properties.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Calculator className="h-4 w-4" />
              {busy ? 'Generando…' : 'Generar liquidación'}
            </button>
          </div>
          {message && <p className="text-sm text-green-700 mt-3">{message}</p>}
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>

        {/* Resumen */}
        <p className="text-sm text-gray-600 mb-3">
          Total por pagar a dueños: <span className="font-semibold text-gray-900">{formatMoney(totalPending)}</span>
        </p>

        {/* Listado */}
        {isLoading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : payouts.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no hay liquidaciones generadas.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                  <th className="py-3 px-4">Dueño</th>
                  <th className="py-3 px-4">Periodo</th>
                  <th className="py-3 px-4">Bruto</th>
                  <th className="py-3 px-4">Comisión</th>
                  <th className="py-3 px-4">Neto</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="text-gray-700">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-gray-900">{ownerName(payout)}</td>
                    <td className="py-3 px-4 whitespace-nowrap capitalize">{formatPeriod(payout.period)}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatMoney(payout.grossAmount)}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-gray-500">-{formatMoney(payout.commission)}</td>
                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-900">
                      {formatMoney(payout.netAmount)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${payoutStatusStyle[payout.status]}`}
                      >
                        {payoutStatusLabel[payout.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {payout.status === PayoutStatus.PAID ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(payout.id)}
                          disabled={markingId === payout.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {markingId === payout.id ? 'Guardando…' : 'Marcar pagado'}
                        </button>
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
