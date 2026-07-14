'use server'

import { revalidatePath } from 'next/cache'
import {
  CostResponsibility,
  MaintenanceStatus,
  PaymentStatus,
  PaymentType,
  PayoutStatus,
  Prisma,
} from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'

// Tipos de pago que cuentan como canon liquidable al dueño.
const CANON_TYPES: PaymentType[] = [PaymentType.CANON, PaymentType.RENT]

// "2026-07" → rango [inicio de mes, inicio de mes siguiente).
const periodRange = (period: string): { start: Date; end: Date } => {
  const match = /^(\d{4})-(\d{2})$/.exec(period)
  if (!match) throw new Error(`Periodo inválido: ${period} (esperado "YYYY-MM")`)
  const year = Number(match[1])
  const month = Number(match[2]) // 1-12
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))
  return { start, end }
}

export type OwnerPayoutLine = {
  ownerId: string
  ownerName: string
  participation: number
  grossAmount: number
  commission: number
  ownerCosts: number // Parte de los costos del dueño (mantenimientos OWNER) descontada a esta línea
  netAmount: number
}

export type PayoutComputation = {
  propertyId: string
  period: string
  propertyGross: number
  propertyCommission: number
  propertyOwnerCosts: number // Mantenimientos COMPLETED con costBearer=OWNER del periodo (F2)
  propertyNet: number
  lines: OwnerPayoutLine[]
}

// Calcula la liquidación de una propiedad para un periodo, SIN persistir (preview).
export const calculateOwnerPayoutsForPeriod = async (
  propertyId: string,
  period: string,
): Promise<PayoutComputation> => {
  const { start, end } = periodRange(period)

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owners: {
        where: { active: true },
        include: { owner: { include: { user: true } } },
      },
      units: {
        include: {
          contracts: {
            include: {
              payments: {
                where: {
                  status: PaymentStatus.PAID,
                  paymentType: { in: CANON_TYPES },
                  dueDate: { gte: start, lt: end },
                },
              },
            },
          },
          // Costos del dueño del periodo: mantenimientos COMPLETED con costBearer=OWNER
          // cuya fecha de finalización cae en el mes liquidado.
          maintenances: {
            where: {
              status: MaintenanceStatus.COMPLETED,
              costBearer: CostResponsibility.OWNER,
              completedDate: { gte: start, lt: end },
            },
          },
        },
      },
    },
  })

  if (!property) throw new Error('Propiedad no encontrada')

  // Bruto y comisión de la propiedad: sumar por contrato aplicando su commissionRate.
  // Costos del dueño: sumar mantenimientos OWNER del periodo por unidad.
  let propertyGross = 0
  let propertyCommission = 0
  let propertyOwnerCosts = 0
  for (const unit of property.units) {
    for (const contract of unit.contracts) {
      const contractGross = contract.payments.reduce((sum, p) => sum + p.amount, 0)
      if (contractGross === 0) continue
      const rate = contract.commissionRate ?? 10
      propertyGross += contractGross
      propertyCommission += contractGross * (rate / 100)
    }
    propertyOwnerCosts += unit.maintenances.reduce((sum, m) => sum + (m.cost ?? 0), 0)
  }
  // TODO F5: descontar también el predial / PropertyTax del periodo aquí.
  const propertyNet = propertyGross - propertyCommission - propertyOwnerCosts

  // Repartir entre dueños según participación.
  const lines: OwnerPayoutLine[] = property.owners.map((po) => {
    const share = po.participation / 100
    const user = po.owner.user
    const ownerName = `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || 'Sin nombre'
    return {
      ownerId: po.ownerId,
      ownerName,
      participation: po.participation,
      grossAmount: propertyGross * share,
      commission: propertyCommission * share,
      ownerCosts: propertyOwnerCosts * share,
      netAmount: propertyNet * share,
    }
  })

  return { propertyId, period, propertyGross, propertyCommission, propertyOwnerCosts, propertyNet, lines }
}

export const calculateOwnerPayoutsAction = async (propertyId: string, period: string) => {
  try {
    const data = await calculateOwnerPayoutsForPeriod(propertyId, period)
    return { success: true, data }
  } catch (error) {
    console.error('Error calculating payouts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al calcular liquidación',
    }
  }
}

// Genera/actualiza los OwnerPayout de una propiedad para un periodo (upsert por ownerId+period).
export const generateOwnerPayoutsForPeriod = async (propertyId: string, period: string) => {
  try {
    const computation = await calculateOwnerPayoutsForPeriod(propertyId, period)

    // Payouts ya pagados de este periodo: no se recalculan (el pago al dueño ya ocurrió).
    const paidOwnerIds = new Set(
      (
        await prisma.ownerPayout.findMany({
          where: { period, status: PayoutStatus.PAID, ownerId: { in: computation.lines.map((l) => l.ownerId) } },
          select: { ownerId: true },
        })
      ).map((p) => p.ownerId),
    )

    const payouts = await prisma.$transaction(
      computation.lines
        .filter((line) => !paidOwnerIds.has(line.ownerId))
        .map((line) =>
          prisma.ownerPayout.upsert({
            where: { ownerId_period: { ownerId: line.ownerId, period } },
            create: {
              ownerId: line.ownerId,
              period,
              grossAmount: line.grossAmount,
              commission: line.commission,
              netAmount: line.netAmount,
            },
            update: {
              grossAmount: line.grossAmount,
              commission: line.commission,
              netAmount: line.netAmount,
            },
          }),
        ),
    )

    revalidatePath('/dashboard/admin/payouts')
    revalidatePath('/dashboard/owner')

    return { success: true, data: payouts }
  } catch (error) {
    console.error('Error generating payouts:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al generar liquidación',
    }
  }
}

const payoutInclude = {
  owner: { include: { user: true } },
} satisfies Prisma.OwnerPayoutInclude

export const getOwnerPayouts = async (ownerId: string) =>
  prisma.ownerPayout.findMany({
    where: { ownerId },
    include: payoutInclude,
    orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
  })

export type OwnerPayoutRow = Awaited<ReturnType<typeof getOwnerPayouts>>[0]

// Propiedades con al menos un dueño (para el selector de liquidación en admin).
export const getPropertiesWithOwners = async () =>
  prisma.property.findMany({
    where: { owners: { some: { active: true } } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

// Todos los payouts para la vista admin (incluye datos del dueño).
export const getAllPayouts = async () =>
  prisma.ownerPayout.findMany({
    include: payoutInclude,
    orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
  })

export type AdminPayoutRow = Awaited<ReturnType<typeof getAllPayouts>>[0]

// Marca un payout como pagado al dueño.
export const markPayoutPaidAction = async (input: { payoutId: string; reference?: string }) => {
  try {
    const data: Prisma.OwnerPayoutUpdateInput = {
      status: PayoutStatus.PAID,
      paidDate: new Date(),
    }
    if (input.reference?.trim()) data.reference = input.reference.trim()

    const updated = await prisma.ownerPayout.update({
      where: { id: input.payoutId },
      data,
      include: payoutInclude,
    })

    revalidatePath('/dashboard/admin/payouts')
    revalidatePath('/dashboard/owner')

    return { success: true, data: updated }
  } catch (error) {
    console.error('Error marking payout paid:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al marcar pagado',
    }
  }
}
