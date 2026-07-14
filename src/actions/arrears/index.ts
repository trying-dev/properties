'use server'

import { PaymentStatus } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

// Estados de pago que cuentan como deuda vencida (impago).
const UNPAID_STATES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.REPORTED,
  PaymentStatus.OVERDUE,
  PaymentStatus.PARTIAL,
]

const MS_PER_DAY = 1000 * 60 * 60 * 24

export type ArrearsRow = {
  contractId: string
  tenantName: string
  property: string
  unitNumber: string
  overdueCount: number // Nº de cuotas vencidas impagas
  totalOverdue: number // Suma de los montos vencidos
  lateFees: number // Recargos por mora ya aplicados
  oldestDueDate: Date // Cuota vencida más antigua
  daysOverdue: number // Días de atraso de la cuota más antigua
}

export type ArrearsReport = {
  rows: ArrearsRow[]
  totalOverdue: number
  totalLateFees: number
  contractsInArrears: number
}

// Reporte de cartera (mora): derivado de Payment vencidos e impagos.
// No hay tabla de mora (§9); se calcula sobre las propiedades que gestiona el admin.
export const getArrearsReport = async (): Promise<ArrearsReport> => {
  const empty: ArrearsReport = { rows: [], totalOverdue: 0, totalLateFees: 0, contractsInArrears: 0 }

  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return empty

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return empty

  const now = new Date()

  const payments = await prisma.payment.findMany({
    where: {
      status: { in: UNPAID_STATES },
      dueDate: { lt: now },
      contract: { unit: { property: { admins: { some: { id: admin.id } } } } },
    },
    select: {
      contractId: true,
      amount: true,
      dueDate: true,
      lateFeeAmount: true,
      contract: {
        select: {
          unit: { select: { unitNumber: true, property: { select: { name: true } } } },
          tenant: { select: { user: { select: { name: true, lastName: true } } } },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  // Agrupar por contrato.
  const byContract = new Map<string, ArrearsRow>()
  for (const p of payments) {
    const existing = byContract.get(p.contractId)
    if (existing) {
      existing.overdueCount += 1
      existing.totalOverdue += p.amount
      existing.lateFees += p.lateFeeAmount ?? 0
      // dueDate más antigua ya es la primera por el orderBy asc.
    } else {
      const u = p.contract.unit
      const user = p.contract.tenant.user
      const tenantName = `${user.name ?? ''} ${user.lastName ?? ''}`.trim() || 'Sin nombre'
      byContract.set(p.contractId, {
        contractId: p.contractId,
        tenantName,
        property: u.property.name,
        unitNumber: u.unitNumber,
        overdueCount: 1,
        totalOverdue: p.amount,
        lateFees: p.lateFeeAmount ?? 0,
        oldestDueDate: p.dueDate,
        daysOverdue: Math.floor((now.getTime() - p.dueDate.getTime()) / MS_PER_DAY),
      })
    }
  }

  const rows = [...byContract.values()].sort((a, b) => b.daysOverdue - a.daysOverdue)
  const totalOverdue = rows.reduce((s, r) => s + r.totalOverdue, 0)
  const totalLateFees = rows.reduce((s, r) => s + r.lateFees, 0)

  return { rows, totalOverdue, totalLateFees, contractsInArrears: rows.length }
}
