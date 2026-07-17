'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import type { PaymentMethod, PaymentStatus, PaymentType } from '+/generated/prisma/client'
import { confirmPaymentAction } from '+/actions/payments'

const PAGE_SIZE = 5

// Estados en los que aún tiene sentido registrar la recepción del pago.
const CONFIRMABLE = new Set<PaymentStatus>(['PENDING', 'REPORTED', 'OVERDUE', 'PARTIAL'])

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
  REPORTED: 'Reportado',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
}

const paymentTypeLabel: Record<PaymentType, string> = {
  CANON: 'Canon',
  RENT: 'Alquiler',
  DEPOSIT: 'Depósito',
  UTILITIES: 'Servicios',
  MAINTENANCE: 'Mantenimiento',
  REPAIR: 'Reparación',
  LATE_FEE: 'Mora',
  OTHER: 'Otro',
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

const formatDate = (value?: Date | string | null) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-CO')
}

const formatMoney = (value?: number | null) => {
  if (value == null) return '-'
  return `$${value.toLocaleString('es-CO')}`
}

const isUrl = (value?: string | null) => Boolean(value && /^https?:\/\//i.test(value))
const isImageProof = (value?: string | null) =>
  Boolean(value && (value.startsWith('data:image') || /\.(png|jpe?g|webp|gif)$/i.test(value)))

type ContractPaymentsProps = {
  payments: Array<{
    id: string
    amount: number
    dueDate: Date
    paidDate: Date | null
    paymentType: PaymentType
    status: PaymentStatus
    paymentMethod: PaymentMethod | null
    transactionId: string | null
    receiptNumber: string | null
    reference: string | null
    proofUrl?: string | null
  }>
}

export default function ContractPayments({ payments }: ContractPaymentsProps) {
  const router = useRouter()
  const sortedPayments = useMemo(
    () => [...payments].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    [payments]
  )
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const visiblePayments = sortedPayments.slice(0, visibleCount)
  const canShowMore = sortedPayments.length > visibleCount

  const handleConfirm = async (paymentId: string) => {
    setConfirmingId(paymentId)
    setError(null)
    try {
      const result = await confirmPaymentAction({ paymentId })
      if (!result.success) setError(result.error ?? 'No se pudo confirmar el pago')
      else router.refresh()
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">Pagos</p>
        <p className="text-xs text-gray-500">
          Mostrando {Math.min(visibleCount, sortedPayments.length)} de {sortedPayments.length}
        </p>
      </div>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="space-y-2">
        {visiblePayments.map((payment) => {
          const hasDetails =
            Boolean(payment.paymentMethod) ||
            Boolean(payment.receiptNumber) ||
            Boolean(payment.transactionId) ||
            Boolean(payment.reference) ||
            Boolean(payment.paidDate)

          return (
            <div key={payment.id} className="flex flex-col gap-2 rounded-lg border border-gray-100 p-3 text-xs text-gray-600">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium text-gray-900">{paymentTypeLabel[payment.paymentType]}</span>
                <span>{formatMoney(payment.amount)}</span>
                <span>Vence: {formatDate(payment.dueDate)}</span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{paymentStatusLabel[payment.status]}</span>
                {payment.paidDate && <span>Pagado: {formatDate(payment.paidDate)}</span>}
                {payment.reference && !isUrl(payment.reference) && <span>Ref: {payment.reference}</span>}
                {payment.proofUrl && (
                  <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={payment.proofUrl} target="_blank" rel="noreferrer">
                    {isImageProof(payment.proofUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={payment.proofUrl} alt="Comprobante" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <ExternalLink className="h-3 w-3" />
                    )}
                    Comprobante
                  </a>
                )}
                {CONFIRMABLE.has(payment.status) && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(payment.id)}
                    disabled={confirmingId === payment.id}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {confirmingId === payment.id ? 'Confirmando…' : 'Confirmar recibido'}
                  </button>
                )}
              </div>
              {hasDetails && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-600">
                  {payment.paymentMethod && (
                    <div>
                      <span className="text-gray-500">Método:</span> {paymentMethodLabel[payment.paymentMethod]}
                    </div>
                  )}
                  {payment.transactionId && (
                    <div>
                      <span className="text-gray-500">Transacción:</span> {payment.transactionId}
                    </div>
                  )}
                  {payment.receiptNumber && (
                    <div>
                      <span className="text-gray-500">Comprobante:</span> {payment.receiptNumber}
                    </div>
                  )}
                  {payment.reference && (
                    <div>
                      <span className="text-gray-500">Referencia:</span>{' '}
                      {isUrl(payment.reference) ? (
                        <a className="text-blue-600 hover:underline" href={payment.reference} target="_blank" rel="noreferrer">
                          {payment.reference}
                        </a>
                      ) : (
                        payment.reference
                      )}
                    </div>
                  )}
                  {payment.paidDate && (
                    <div>
                      <span className="text-gray-500">Pagado:</span> {formatDate(payment.paidDate)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {canShowMore && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => Math.min(current + PAGE_SIZE, sortedPayments.length))}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Ver 5 más
          </button>
        </div>
      )}
    </div>
  )
}
