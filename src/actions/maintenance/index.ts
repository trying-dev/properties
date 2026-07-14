'use server'

import { revalidatePath } from 'next/cache'
import { CostResponsibility, MaintenanceStatus, MaintenanceType, Prisma } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

const maintenanceInclude = {
  unit: { include: { property: { select: { id: true, name: true } } } },
} satisfies Prisma.MaintenanceInclude

export type MaintenanceRow = Prisma.MaintenanceGetPayload<{ include: typeof maintenanceInclude }>

// Admin autenticado que gestiona la unidad. Devuelve userId o error.
const requireAdminForUnit = async (unitId: string) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'No autenticado' as const }

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return { error: 'No autorizado' as const }

  const unit = await prisma.unit.findFirst({
    where: { id: unitId, property: { admins: { some: { id: admin.id } } } },
    select: { id: true },
  })
  if (!unit) return { error: 'Unidad no encontrada' as const }

  return { userId }
}

export const getUnitMaintenances = async (unitId: string) =>
  prisma.maintenance.findMany({
    where: { unitId },
    orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
  })

export const getAdminMaintenances = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.maintenance.findMany({
    where: { unit: { property: { admins: { some: { id: admin.id } } } } },
    include: maintenanceInclude,
    orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
  })
}

export type AdminMaintenanceRow = Awaited<ReturnType<typeof getAdminMaintenances>>[0]

export const createMaintenanceAction = async (input: {
  unitId: string
  type: MaintenanceType
  title: string
  costBearer?: CostResponsibility
  description?: string
  provider?: string
  cost?: number
  scheduledDate?: string
  inspectionId?: string
  recurrenceMonths?: number
  severity?: string
  estimatedLoss?: number
}) => {
  const guard = await requireAdminForUnit(input.unitId)
  if ('error' in guard) return { success: false, error: guard.error }

  if (!input.title?.trim()) return { success: false, error: 'El título es obligatorio' }

  try {
    const maintenance = await prisma.maintenance.create({
      data: {
        unitId: input.unitId,
        type: input.type,
        title: input.title.trim(),
        costBearer: input.costBearer ?? CostResponsibility.OWNER,
        description: input.description?.trim() || null,
        provider: input.provider?.trim() || null,
        cost: input.cost ?? null,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        inspectionId: input.inspectionId || null,
        recurrenceMonths: input.recurrenceMonths ?? null,
        severity: input.severity?.trim() || null,
        estimatedLoss: input.estimatedLoss ?? null,
      },
      include: maintenanceInclude,
    })

    revalidatePath('/dashboard/admin/maintenance')
    return { success: true, data: maintenance }
  } catch (error) {
    console.error('Error creating maintenance:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear mantenimiento' }
  }
}

// Marca un mantenimiento como COMPLETED, fija completedDate y el costo real.
// Para preventivos con recurrencia, calcula la próxima fecha.
export const completeMaintenanceAction = async (input: {
  maintenanceId: string
  cost?: number
  diagnosis?: string
  solution?: string
}) => {
  try {
    const existing = await prisma.maintenance.findUnique({
      where: { id: input.maintenanceId },
      select: { unitId: true, recurrenceMonths: true },
    })
    if (!existing) return { success: false, error: 'Mantenimiento no encontrado' }

    const guard = await requireAdminForUnit(existing.unitId)
    if ('error' in guard) return { success: false, error: guard.error }

    const completedDate = new Date()

    // Preventivo recurrente → próxima fecha = completed + recurrenceMonths.
    let nextDueDate: Date | null = null
    if (existing.recurrenceMonths && existing.recurrenceMonths > 0) {
      nextDueDate = new Date(completedDate)
      nextDueDate.setMonth(nextDueDate.getMonth() + existing.recurrenceMonths)
    }

    const data: Prisma.MaintenanceUpdateInput = {
      status: MaintenanceStatus.COMPLETED,
      completedDate,
      nextDueDate,
    }
    if (input.cost != null) data.cost = input.cost
    if (input.diagnosis?.trim()) data.diagnosis = input.diagnosis.trim()
    if (input.solution?.trim()) data.solution = input.solution.trim()

    const maintenance = await prisma.maintenance.update({
      where: { id: input.maintenanceId },
      data,
      include: maintenanceInclude,
    })

    revalidatePath('/dashboard/admin/maintenance')
    revalidatePath('/dashboard/admin/payouts') // el costo OWNER afecta la liquidación
    return { success: true, data: maintenance }
  } catch (error) {
    console.error('Error completing maintenance:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al completar mantenimiento' }
  }
}

export const cancelMaintenanceAction = async (input: { maintenanceId: string }) => {
  try {
    const existing = await prisma.maintenance.findUnique({
      where: { id: input.maintenanceId },
      select: { unitId: true },
    })
    if (!existing) return { success: false, error: 'Mantenimiento no encontrado' }

    const guard = await requireAdminForUnit(existing.unitId)
    if ('error' in guard) return { success: false, error: guard.error }

    const maintenance = await prisma.maintenance.update({
      where: { id: input.maintenanceId },
      data: { status: MaintenanceStatus.CANCELLED },
      include: maintenanceInclude,
    })

    revalidatePath('/dashboard/admin/maintenance')
    return { success: true, data: maintenance }
  } catch (error) {
    console.error('Error cancelling maintenance:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al cancelar mantenimiento' }
  }
}
