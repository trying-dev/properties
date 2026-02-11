'use client'

import { useMemo, useState } from 'react'
import type { PaymentMethod, PaymentStatus, PaymentType } from '@prisma/client'

const PAGE_SIZE = 5

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Pendiente',
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
  }>
}

export default function ContractPayments({ payments }: ContractPaymentsProps) {
  const sortedPayments = useMemo(
    () => [...payments].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()),
    [payments]
  )
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const visiblePayments = sortedPayments.slice(0, visibleCount)
  const canShowMore = sortedPayments.length > visibleCount

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-900">Pagos</p>
        <p className="text-xs text-gray-500">
          Mostrando {Math.min(visibleCount, sortedPayments.length)} de {sortedPayments.length}
        </p>
      </div>
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
