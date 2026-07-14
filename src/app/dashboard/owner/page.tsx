'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Home, TrendingUp, Wallet } from 'lucide-react'
import { PayoutStatus, UnitStatus } from '+/generated/prisma/enums'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { getOwnerDashboard, type OwnerDashboard } from '+/actions/owner'

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

export default function OwnerDashboardPage() {
  const [data, setData] = useState<OwnerDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const owner = await getOwnerDashboard()
        setData(owner)
      } catch (err) {
        console.error('Error loading owner dashboard:', err)
        setError('No se pudo cargar el panel del dueño')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const totals = useMemo(() => {
    const payouts = data?.payouts ?? []
    const pendingNet = payouts
      .filter((p) => p.status !== PayoutStatus.PAID)
      .reduce((sum, p) => sum + p.netAmount, 0)
    const paidNet = payouts.filter((p) => p.status === PayoutStatus.PAID).reduce((sum, p) => sum + p.netAmount, 0)
    return { pendingNet, paidNet, propertyCount: data?.properties.length ?? 0 }
  }, [data])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Panel del dueño</h1>
        <p className="text-sm text-gray-500 mb-6">Tus propiedades y liquidaciones mensuales.</p>

        {isLoading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !data ? (
          <p className="text-gray-500">No hay datos de dueño para tu cuenta.</p>
        ) : (
          <>
            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
                  <Building2 className="h-4 w-4" /> Propiedades
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{totals.propertyCount}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
                  <Wallet className="h-4 w-4" /> Por cobrar
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatMoney(totals.pendingNet)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
                  <TrendingUp className="h-4 w-4" /> Cobrado
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatMoney(totals.paidNet)}</p>
              </div>
            </div>

            {/* Propiedades */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Mis propiedades</h2>
              {data.properties.length === 0 ? (
                <p className="text-gray-500 text-sm">No tienes propiedades registradas.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.properties.map((po) => {
                    const property = po.property
                    const address = `${property.street ?? ''} ${property.number ?? ''}, ${property.neighborhood ?? ''}, ${property.city ?? ''}`.trim()
                    const occupied = property.units.filter((u) => u.status === UnitStatus.OCCUPIED).length
                    return (
                      <div key={po.id} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-900">{property.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{address}</p>
                          </div>
                          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            {po.participation}% participación
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Home className="h-4 w-4" /> {property.units.length} unidades
                          </span>
                          <span className="text-gray-400">·</span>
                          <span>
                            {occupied} ocupadas / {property.units.length - occupied} libres
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {/* Liquidaciones */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Mis liquidaciones</h2>
              {data.payouts.length === 0 ? (
                <p className="text-gray-500 text-sm">Aún no hay liquidaciones generadas.</p>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
                        <th className="py-3 px-4">Periodo</th>
                        <th className="py-3 px-4">Bruto</th>
                        <th className="py-3 px-4">Comisión</th>
                        <th className="py-3 px-4">Neto</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Referencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.payouts.map((payout) => (
                        <tr key={payout.id} className="text-gray-700">
                          <td className="py-3 px-4 whitespace-nowrap capitalize font-medium text-gray-900">
                            {formatPeriod(payout.period)}
                          </td>
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
                          <td className="py-3 px-4 whitespace-nowrap">{payout.reference ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
