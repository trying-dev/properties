'use server'

import { revalidatePath } from 'next/cache'
import { PaymentStatus, Prisma } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

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

export type AdminPaymentRow = Awaited<ReturnType<typeof getAdminPayments>>[0]

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
        in: [PaymentStatus.PENDING, PaymentStatus.REPORTED, PaymentStatus.OVERDUE, PaymentStatus.PARTIAL],
      },
    },
  })

// Pierna 1 · Tenant reporta que pagó (sube comprobante) → status REPORTED.
export const reportPaymentAction = async (input: { paymentId: string; proofUrl?: string; notes?: string }) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const tenant = await prisma.tenant.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (!tenant?.id) return { success: false, error: 'No se encontró inquilino' }

    // El pago debe pertenecer a un contrato del inquilino autenticado.
    const payment = await prisma.payment.findFirst({
      where: { id: input.paymentId, contract: { tenantId: tenant.id } },
      select: { id: true, status: true },
    })
    if (!payment) return { success: false, error: 'Pago no encontrado' }
    if (payment.status === PaymentStatus.PAID) {
      return { success: false, error: 'El pago ya está confirmado' }
    }

    const data: Prisma.PaymentUpdateInput = {
      status: PaymentStatus.REPORTED,
      reportedAt: new Date(),
    }
    if (input.proofUrl?.trim()) data.proofUrl = input.proofUrl.trim()
    if (input.notes?.trim()) data.notes = input.notes.trim()

    const updated = await prisma.payment.update({
      where: { id: input.paymentId },
      data,
      include: paymentInclude,
    })

    revalidatePath('/dashboard/tenant/units')
    revalidatePath('/dashboard/admin/payments')

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error reporting payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reportar pago',
    }
  }
}

// Pierna 1 · Properties revisa y confirma el pago reportado → status PAID.
export const confirmPaymentAction = async (input: {
  paymentId: string
  receiptNumber?: string
  reference?: string
  notes?: string
  transactionId?: string
}) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const data: Prisma.PaymentUpdateInput = {
      status: PaymentStatus.PAID,
      paidDate: new Date(),
      confirmedAt: new Date(),
      confirmedById: userId,
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
