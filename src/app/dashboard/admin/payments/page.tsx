'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react'
import { PaymentMethod, PaymentStatus, PaymentType } from '@prisma/client'

import Header from '+/components/Header'
import { confirmPaymentAction, getAdminPaymentsAction } from '+/actions/payments'
import type { AdminPaymentRow } from '+/actions/payments'

const statusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
}

const statusStyles: Record<PaymentStatus, { badge: string; icon: typeof Clock }> = {
  PENDING: { badge: 'bg-yellow-100 text-yellow-700', icon: Clock },
  PAID: { badge: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  OVERDUE: { badge: 'bg-red-100 text-red-700', icon: AlertTriangle },
  PARTIAL: { badge: 'bg-orange-100 text-orange-700', icon: Clock },
  CANCELLED: { badge: 'bg-gray-100 text-gray-600', icon: XCircle },
}

const paymentMethodLabel: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  BANK_TRANSFER: 'Transferencia',
  CHECK: 'Cheque',
  CREDIT_CARD: 'Tarjeta crédito',
  DEBIT_CARD: 'Tarjeta débito',
  DIGITAL_WALLET: 'Billetera digital',
  OTHER: 'Otro',
}

const paymentTypeLabel: Record<PaymentType, string> = {
  RENT: 'Arriendo',
  DEPOSIT: 'Depósito',
  UTILITIES: 'Servicios',
  MAINTENANCE: 'Mantenimiento',
  LATE_FEE: 'Recargo',
  OTHER: 'Otro',
}

const formatDate = (value?: Date | string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO')
}

const formatMonthLabel = (value: Date | string) =>
  new Date(value).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

const formatMoney = (value?: number | null) => {
  if (value == null) return '-'
  return `$${value.toLocaleString('es-CO')}`
}

const unpaidStatuses = new Set<PaymentStatus>([PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL])

type StatusFilter = 'ALL' | 'UNPAID' | PaymentStatus

type ConfirmFormState = {
  receiptNumber: string
  reference: string
  transactionId: string
  notes: string
}

const emptyFormState: ConfirmFormState = {
  receiptNumber: '',
  reference: '',
  transactionId: '',
  notes: '',
}

const groupByMonth = (items: AdminPaymentRow[]) => {
  const sorted = [...items].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
  const groups: Array<{ key: string; label: string; items: AdminPaymentRow[] }> = []

  sorted.forEach((payment) => {
    const key = `${new Date(payment.dueDate).getFullYear()}-${new Date(payment.dueDate).getMonth()}`
    const existing = groups[groups.length - 1]
    if (!existing || existing.key !== key) {
      groups.push({
        key,
        label: formatMonthLabel(payment.dueDate),
        items: [payment],
      })
    } else {
      existing.items.push(payment)
    }
  })

  return groups
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [propertyFilter, setPropertyFilter] = useState('')
  const [tenantFilter, setTenantFilter] = useState('')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | ''>('')
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null)
  const [formState, setFormState] = useState<ConfirmFormState>(emptyFormState)
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getAdminPaymentsAction()
        if (!result.success || !result.data) {
          setError(result.error ?? 'No se pudieron cargar los pagos')
          setPayments([])
          return
        }
        setPayments(result.data)
      } catch (err) {
        console.error('Error loading payments:', err)
        setError('No se pudieron cargar los pagos')
      } finally {
        setIsLoading(false)
      }
    }

    loadPayments()
  }, [])

  const propertyOptions = useMemo(() => {
    const map = new Map<string, string>()
    payments.forEach((payment) => {
      const property = payment.contract?.unit?.property
      if (property?.id && !map.has(property.id)) map.set(property.id, property.name ?? 'Propiedad')
    })
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es-CO'))
  }, [payments])

  const tenantOptions = useMemo(() => {
    const map = new Map<string, string>()
    payments.forEach((payment) => {
      const tenant = payment.contract?.tenant
      const user = tenant?.user
      if (!tenant?.id || map.has(tenant.id)) return
      const fullName = `${user?.name ?? ''} ${user?.lastName ?? ''}`.trim()
      const label = fullName || user?.email || 'Inquilino'
      map.set(tenant.id, label)
    })
    return Array.from(map.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es-CO'))
  }, [payments])

  const methodOptions = useMemo(() => {
    const set = new Set<PaymentMethod>()
    payments.forEach((payment) => {
      if (payment.paymentMethod) set.add(payment.paymentMethod)
    })
    return Array.from(set).sort()
  }, [payments])

  const filteredPayments = useMemo(() => {
    let result = payments
    if (statusFilter === 'UNPAID') {
      result = result.filter((payment) => unpaidStatuses.has(payment.status))
    } else if (statusFilter !== 'ALL') {
      result = result.filter((payment) => payment.status === statusFilter)
    }

    if (propertyFilter) {
      result = result.filter((payment) => payment.contract?.unit?.property?.id === propertyFilter)
    }

    if (tenantFilter) {
      result = result.filter((payment) => payment.contract?.tenant?.id === tenantFilter)
    }

    if (methodFilter) {
      result = result.filter((payment) => payment.paymentMethod === methodFilter)
    }

    return result
  }, [payments, statusFilter, propertyFilter, tenantFilter, methodFilter])

  const unpaidPayments = useMemo(() => filteredPayments.filter((payment) => unpaidStatuses.has(payment.status)), [filteredPayments])
  const paidPayments = useMemo(() => filteredPayments.filter((payment) => payment.status === PaymentStatus.PAID), [filteredPayments])
  const cancelledPayments = useMemo(
    () => filteredPayments.filter((payment) => payment.status === PaymentStatus.CANCELLED),
    [filteredPayments]
  )

  const openConfirmForm = (payment: AdminPaymentRow) => {
    setActivePaymentId(payment.id)
    setConfirmError(null)
    setFormState({
      receiptNumber: payment.receiptNumber ?? '',
      reference: payment.reference ?? '',
      transactionId: payment.transactionId ?? '',
      notes: payment.notes ?? '',
    })
  }

  const closeConfirmForm = () => {
    setActivePaymentId(null)
    setFormState(emptyFormState)
    setConfirmError(null)
  }

  const handleConfirm = async () => {
    if (!activePaymentId) return

    try {
      setIsConfirming(true)
      setConfirmError(null)
      const result = await confirmPaymentAction({
        paymentId: activePaymentId,
        receiptNumber: formState.receiptNumber,
        reference: formState.reference,
        transactionId: formState.transactionId,
        notes: formState.notes,
      })

      if (!result.success || !result.data) {
        setConfirmError(result.error ?? 'No se pudo confirmar el pago')
        return
      }

      setPayments((prev) => prev.map((payment) => (payment.id === result.data?.id ? result.data : payment)))
      closeConfirmForm()
    } catch (err) {
      console.error('Error confirming payment:', err)
      setConfirmError('No se pudo confirmar el pago')
    } finally {
      setIsConfirming(false)
    }
  }

  const renderPaymentRow = (payment: AdminPaymentRow) => {
    const tenantName = payment.contract?.tenant?.user
      ? `${payment.contract.tenant.user.name ?? ''} ${payment.contract.tenant.user.lastName ?? ''}`.trim()
      : 'Sin inquilino'
    const propertyName = payment.contract?.unit?.property?.name ?? 'Propiedad'
    const unitNumber = payment.contract?.unit?.unitNumber ?? '-'
    const statusMeta = statusStyles[payment.status]
    const StatusIcon = statusMeta.icon
    const isPaid = payment.status === PaymentStatus.PAID
    const isCancelled = payment.status === PaymentStatus.CANCELLED
    const isActive = activePaymentId === payment.id

    return (
      <div key={payment.id} className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Inquilino</p>
            <p className="text-sm font-semibold text-gray-900">{tenantName || 'Sin nombre'}</p>
            <p className="text-xs text-gray-500 mt-1">{propertyName} · Unidad {unitNumber}</p>
            <p className="text-xs text-gray-500 mt-1">{paymentTypeLabel[payment.paymentType]}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Monto</p>
            <p className="text-sm font-semibold text-gray-900">{formatMoney(payment.amount)}</p>
            <p className="text-xs text-gray-500 mt-1">Vence: {formatDate(payment.dueDate)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Estado</p>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusMeta.badge}`}>
              <StatusIcon className="h-3 w-3" />
              {statusLabel[payment.status]}
            </span>
            <p className="text-xs text-gray-500 mt-2">Pagado: {formatDate(payment.paidDate)}</p>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">Método</p>
            <p className="text-sm font-semibold text-gray-900">
              {payment.paymentMethod ? paymentMethodLabel[payment.paymentMethod] : 'Sin definir'}
            </p>
            {payment.receiptNumber && <p className="text-xs text-gray-500">Comprobante: {payment.receiptNumber}</p>}
            {payment.reference && <p className="text-xs text-gray-500">Referencia: {payment.reference}</p>}
            {payment.transactionId && <p className="text-xs text-gray-500">Transacción: {payment.transactionId}</p>}
            {!isPaid && !isCancelled && (
              <button
                type="button"
                onClick={() => openConfirmForm(payment)}
                className="mt-1 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50"
              >
                Confirmar pago
              </button>
            )}
            {isPaid && (
              <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">Confirmado</span>
            )}
            {isCancelled && (
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Cancelado</span>
            )}
          </div>
        </div>

        {isActive && !isPaid && !isCancelled && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-2 text-sm text-gray-700">
                Número de comprobante
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2"
                  value={formState.receiptNumber}
                  onChange={(event) => setFormState((prev) => ({ ...prev, receiptNumber: event.target.value }))}
                  placeholder="Ej: 12345"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-gray-700">
                Referencia o enlace del comprobante
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2"
                  value={formState.reference}
                  onChange={(event) => setFormState((prev) => ({ ...prev, reference: event.target.value }))}
                  placeholder="Ej: https://..."
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-gray-700">
                ID de transacción
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2"
                  value={formState.transactionId}
                  onChange={(event) => setFormState((prev) => ({ ...prev, transactionId: event.target.value }))}
                  placeholder="Ej: TRX-00001"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-gray-700">
                Notas
                <input
                  type="text"
                  className="border rounded-lg px-3 py-2"
                  value={formState.notes}
                  onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Observaciones internas"
                />
              </label>
            </div>
            {confirmError && <p className="text-sm text-red-600 mt-3">{confirmError}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-semibold hover:bg-gray-800 disabled:opacity-60"
              >
                {isConfirming ? 'Confirmando...' : 'Confirmar pago'}
              </button>
              <button
                type="button"
                onClick={closeConfirmForm}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const unpaidGroups = useMemo(() => groupByMonth(unpaidPayments), [unpaidPayments])
  const paidGroups = useMemo(() => groupByMonth(paidPayments), [paidPayments])
  const cancelledGroups = useMemo(() => groupByMonth(cancelledPayments), [cancelledPayments])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
            <p className="text-gray-600">Confirma pagos manuales y revisa el historial por mes.</p>
          </div>
          <span className="bg-gray-900 text-white text-sm font-semibold px-3 py-1 rounded-full">{payments.length}</span>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              Estado
              <select
                className="border rounded-lg px-3 py-2"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <option value="ALL">Todos</option>
                <option value="UNPAID">Por confirmar</option>
                {Object.values(PaymentStatus).map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              Propiedad
              <select
                className="border rounded-lg px-3 py-2"
                value={propertyFilter}
                onChange={(event) => setPropertyFilter(event.target.value)}
              >
                <option value="">Todas</option>
                {propertyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              Inquilino
              <select
                className="border rounded-lg px-3 py-2"
                value={tenantFilter}
                onChange={(event) => setTenantFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {tenantOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              Método
              <select
                className="border rounded-lg px-3 py-2"
                value={methodFilter}
                onChange={(event) => setMethodFilter(event.target.value as PaymentMethod | '')}
              >
                <option value="">Todos</option>
                {methodOptions.map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabel[method]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando pagos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No hay pagos para los filtros seleccionados.</div>
        ) : (
          <div className="space-y-10">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Por confirmar</h2>
                <span className="text-sm text-gray-600">{unpaidPayments.length} pagos</span>
              </div>
              {unpaidGroups.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pagos pendientes por confirmar.</p>
              ) : (
                <div className="space-y-6">
                  {unpaidGroups.map((group) => (
                    <div key={group.key}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{group.label}</h3>
                      <div className="space-y-4">{group.items.map((payment) => renderPaymentRow(payment))}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Confirmados</h2>
                <span className="text-sm text-gray-600">{paidPayments.length} pagos</span>
              </div>
              {paidGroups.length === 0 ? (
                <p className="text-sm text-gray-500">No hay pagos confirmados todavía.</p>
              ) : (
                <div className="space-y-6">
                  {paidGroups.map((group) => (
                    <div key={group.key}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{group.label}</h3>
                      <div className="space-y-4">{group.items.map((payment) => renderPaymentRow(payment))}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {cancelledPayments.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Cancelados</h2>
                  <span className="text-sm text-gray-600">{cancelledPayments.length} pagos</span>
                </div>
                <div className="space-y-6">
                  {cancelledGroups.map((group) => (
                    <div key={group.key}>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{group.label}</h3>
                      <div className="space-y-4">{group.items.map((payment) => renderPaymentRow(payment))}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
