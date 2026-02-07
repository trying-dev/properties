'use server'

import { revalidatePath } from 'next/cache'
import { Prisma, PaymentStatus } from '@prisma/client'
import { prisma } from '+/lib/prisma'

const paymentInclude = {
  contract: {
    include: {
      unit: {
        include: {
          property: true,
        },
      },
      tenant: {
        include: {
          user: true,
        },
      },
    },
  },
}

export const getAdminPayments = async () =>
  prisma.payment.findMany({
    include: paymentInclude,
    orderBy: [{ dueDate: 'desc' }, { createdAt: 'desc' }],
  })

export type AdminPaymentRow = Prisma.PromiseReturnType<typeof getAdminPayments>[0]

export const getAdminPaymentsAction = async () => {
  try {
    const payments = await getAdminPayments()
    return { success: true, data: payments }
  } catch (error) {
    console.error('Error fetching admin payments:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener pagos',
    }
  }
}

export const getPendingPaymentsCount = async () =>
  prisma.payment.count({
    where: {
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL],
      },
    },
  })

export const confirmPaymentAction = async (input: {
  paymentId: string
  receiptNumber?: string
  reference?: string
  notes?: string
  transactionId?: string
}) => {
  try {
    const data: Prisma.PaymentUpdateInput = {
      status: PaymentStatus.PAID,
      paidDate: new Date(),
    }

    if (input.receiptNumber?.trim()) data.receiptNumber = input.receiptNumber.trim()
    if (input.reference?.trim()) data.reference = input.reference.trim()
    if (input.transactionId?.trim()) data.transactionId = input.transactionId.trim()
    if (input.notes?.trim()) data.notes = input.notes.trim()

    const updated = await prisma.payment.update({
      where: { id: input.paymentId },
      data,
      include: paymentInclude,
    })

    revalidatePath('/dashboard/admin/payments')

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error confirming payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al confirmar pago',
    }
  }
}
