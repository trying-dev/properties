import { PaymentStatus, PaymentType } from '@prisma/client'
import { prisma } from '+/lib/prisma'

export const getMonthWindow = (date = new Date()) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const dueDate = new Date(year, month, 5)
  const dueDateEnd = new Date(year, month, 6)
  return { dueDate, dueDateEnd }
}

export const generateMonthlyPaymentsForActiveContracts = async (date = new Date()) => {
  const { dueDate, dueDateEnd } = getMonthWindow(date)

  const contracts = await prisma.contract.findMany({
    where: {
      status: 'ACTIVE',
    },
    select: {
      id: true,
      rent: true,
    },
  })

  if (contracts.length === 0) {
    return { success: true, created: 0, skipped: 0 }
  }

  const contractIds = contracts.map((contract) => contract.id)
  const existingPayments = await prisma.payment.findMany({
    where: {
      contractId: { in: contractIds },
      dueDate: { gte: dueDate, lt: dueDateEnd },
    },
    select: { contractId: true },
  })

  const existingMap = new Set(existingPayments.map((payment) => payment.contractId))
  const paymentsToCreate = contracts
    .filter((contract) => !existingMap.has(contract.id))
    .map((contract) => ({
      contractId: contract.id,
      amount: contract.rent,
      dueDate,
      paymentType: PaymentType.RENT,
      status: PaymentStatus.PENDING,
      notes: `Pago mensual ${dueDate.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`,
    }))

  if (paymentsToCreate.length === 0) {
    return { success: true, created: 0, skipped: contracts.length }
  }

  await prisma.payment.createMany({
    data: paymentsToCreate,
  })

  return { success: true, created: paymentsToCreate.length, skipped: contracts.length - paymentsToCreate.length }
}
