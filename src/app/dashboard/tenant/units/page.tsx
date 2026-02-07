'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Home, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { PaymentStatus } from '@prisma/client'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { getUserTenant, type UserTenant } from '+/actions/user'

const formatDate = (value?: Date | string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO')
}

const formatMoney = (value?: number | null) => {
  if (value == null) return '-'
  return `$${value.toLocaleString('es-CO')}`
}

type ContractRow = NonNullable<UserTenant['tenant']>['contracts'][0]

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
}

const paymentStatusStyle: Record<PaymentStatus, { badge: string; icon: typeof Clock }> = {
  PENDING: { badge: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { badge: 'bg-green-100 text-green-700', icon: CheckCircle },
  OVERDUE: { badge: 'bg-red-100 text-red-700', icon: AlertTriangle },
  PARTIAL: { badge: 'bg-orange-100 text-orange-700', icon: Clock },
  CANCELLED: { badge: 'bg-gray-100 text-gray-600', icon: Clock },
}

const pendingStatuses = new Set<PaymentStatus>([PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL])

export default function TenantUnitsPage() {
  const [contracts, setContracts] = useState<ContractRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedContractId, setExpandedContractId] = useState<string | null>(null)
  const [visiblePaymentsByContract, setVisiblePaymentsByContract] = useState<Record<string, number>>({})

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const user = await getUserTenant()
        setContracts(user?.tenant?.contracts ?? [])
      } catch (err) {
        console.error('Error loading tenant units:', err)
        setError('No se pudieron cargar las unidades')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const contractCards = useMemo(() => {
    return contracts.map((contract) => {
      const unit = contract.unit
      const property = unit?.property
      const address = property
        ? `${property.street ?? ''} ${property.number ?? ''}, ${property.neighborhood ?? ''}, ${property.city ?? ''}`.trim()
        : 'Dirección no disponible'

      const payments = [...(contract.payments ?? [])].sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )
      const latestPayment = payments[0]
      const pendingCount = payments.filter((payment) => pendingStatuses.has(payment.status)).length

      return {
        contract,
        unit,
        property,
        address,
        latestPayment,
        payments,
        pendingCount,
      }
    })
  }, [contracts])

  const toggleContract = (contractId: string) => {
    setExpandedContractId((current) => (current === contractId ? null : contractId))
    setVisiblePaymentsByContract((current) =>
      current[contractId]
        ? current
        : {
            ...current,
            [contractId]: 10,
          }
    )
  }

  const showMorePayments = (contractId: string, total: number) => {
    setVisiblePaymentsByContract((current) => {
      const nextCount = Math.min((current[contractId] ?? 10) + 10, total)
      return {
        ...current,
        [contractId]: nextCount,
      }
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard/tenant" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unidades en arriendo</h1>
            <p className="text-gray-600">Tus contratos y estado de pagos asociados.</p>
          </div>
          <span className="bg-gray-900 text-white text-sm font-semibold px-3 py-1 rounded-full">{contracts.length}</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando unidades...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : contractCards.length === 0 ? (
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes unidades alquiladas</h3>
            <p className="text-gray-600 mb-6">Explora nuestro catálogo y encuentra tu próximo hogar</p>
            <Link
              href="/propiedades"
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>Buscar Propiedades</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contractCards.map(({ contract, unit, property, address, latestPayment, payments, pendingCount }) => {
              const statusMeta = latestPayment ? paymentStatusStyle[latestPayment.status] : null
              const StatusIcon = statusMeta?.icon
              const isExpanded = expandedContractId === contract.id

              return (
                <div key={contract.id} className="border border-gray-200 rounded-lg p-5 bg-white">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{property?.name ?? 'Unidad'}</h3>
                        <p className="text-sm text-gray-500">{address}</p>
                        <p className="text-xs text-gray-500 mt-1">Unidad: {unit?.unitNumber ?? '-'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
                      <div className="text-sm text-gray-600">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Contrato</p>
                        <p className="font-semibold text-gray-900">{contract.status}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Renta</p>
                        <p className="font-semibold text-gray-900">{formatMoney(contract.rent)}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Vigencia</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Pagos pendientes</p>
                        <p className="font-semibold text-gray-900">{pendingCount}</p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="text-xs uppercase tracking-wide text-gray-500">Último pago</p>
                      {latestPayment ? (
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              statusMeta?.badge ?? 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            {paymentStatusLabel[latestPayment.status]}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">Vence: {formatDate(latestPayment.dueDate)}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Sin pagos registrados</p>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <button
                        type="button"
                        onClick={() => toggleContract(contract.id)}
                        className="mt-2 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        {isExpanded ? 'Ocultar pagos' : 'Ver pagos'}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      {payments.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay pagos registrados para este contrato.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>
                              Mostrando {Math.min(visiblePaymentsByContract[contract.id] ?? 10, payments.length)} de {payments.length}
                            </span>
                          </div>
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="py-2 pr-4">Vence</th>
                                <th className="py-2 pr-4">Monto</th>
                                <th className="py-2 pr-4">Estado</th>
                                <th className="py-2 pr-4">Pagado</th>
                                <th className="py-2 pr-4">Referencia</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {payments.slice(0, visiblePaymentsByContract[contract.id] ?? 10).map((payment) => {
                                const meta = paymentStatusStyle[payment.status]
                                const PaymentIcon = meta.icon
                                return (
                                  <tr key={payment.id} className="text-gray-700">
                                    <td className="py-2 pr-4 whitespace-nowrap">{formatDate(payment.dueDate)}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap">{formatMoney(payment.amount)}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap">
                                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
                                        <PaymentIcon className="h-3 w-3" />
                                        {paymentStatusLabel[payment.status]}
                                      </span>
                                    </td>
                                    <td className="py-2 pr-4 whitespace-nowrap">{formatDate(payment.paidDate)}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap">{payment.reference ?? '-'}</td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          {payments.length > (visiblePaymentsByContract[contract.id] ?? 10) && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => showMorePayments(contract.id, payments.length)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                              >
                                Ver 10 más
                              </button>
                            </div>
                          )}
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

      <Footer />
    </div>
  )
}
