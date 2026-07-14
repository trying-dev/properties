'use server'

import { revalidatePath } from 'next/cache'
import { InspectionCondition, InspectionStatus, InspectionType, Prisma } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

const inspectionInclude = {
  unit: {
    include: { property: { select: { id: true, name: true } } },
  },
} satisfies Prisma.InspectionInclude

export type InspectionRow = Prisma.InspectionGetPayload<{ include: typeof inspectionInclude }>

// Admin autenticado dueño de la gestión de una unidad. Devuelve el userId o null.
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

export const getUnitInspections = async (unitId: string) =>
  prisma.inspection.findMany({
    where: { unitId },
    orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
  })

export const getInspection = async (id: string) =>
  prisma.inspection.findUnique({ where: { id }, include: inspectionInclude })

// Todas las inspecciones gestionadas por el admin autenticado (para la vista admin).
export const getAdminInspections = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.inspection.findMany({
    where: { unit: { property: { admins: { some: { id: admin.id } } } } },
    include: inspectionInclude,
    orderBy: [{ scheduledDate: 'desc' }, { createdAt: 'desc' }],
  })
}

export type AdminInspectionRow = Awaited<ReturnType<typeof getAdminInspections>>[0]

// Unidades gestionadas por el admin autenticado (para el selector de nueva inspección).
export const getAdminUnitsForSelect = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  const units = await prisma.unit.findMany({
    where: { property: { admins: { some: { id: admin.id } } } },
    select: { id: true, unitNumber: true, property: { select: { name: true } } },
    orderBy: [{ property: { name: 'asc' } }, { unitNumber: 'asc' }],
  })

  return units.map((u) => ({ id: u.id, label: `${u.property.name} · ${u.unitNumber}` }))
}

export const createInspectionAction = async (input: {
  unitId: string
  type: InspectionType
  contractId?: string
  scheduledDate?: string
  notes?: string
}) => {
  const guard = await requireAdminForUnit(input.unitId)
  if ('error' in guard) return { success: false, error: guard.error }

  try {
    const inspection = await prisma.inspection.create({
      data: {
        unitId: input.unitId,
        type: input.type,
        contractId: input.contractId || null,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : null,
        notes: input.notes?.trim() || null,
      },
      include: inspectionInclude,
    })

    revalidatePath('/dashboard/admin/inspections')
    return { success: true, data: inspection }
  } catch (error) {
    console.error('Error creating inspection:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear inspección' }
  }
}

// Registra el resultado de una inspección → COMPLETED, y actualiza Unit.lastInspectionDate.
export const completeInspectionAction = async (input: {
  inspectionId: string
  overallCondition?: InspectionCondition
  score?: number
  criticalFindings?: number
  payload?: Prisma.InputJsonValue
  notes?: string
}) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const existing = await prisma.inspection.findUnique({
      where: { id: input.inspectionId },
      select: { id: true, unitId: true },
    })
    if (!existing) return { success: false, error: 'Inspección no encontrada' }

    const guard = await requireAdminForUnit(existing.unitId)
    if ('error' in guard) return { success: false, error: guard.error }

    const performedDate = new Date()

    const data: Prisma.InspectionUpdateInput = {
      status: InspectionStatus.COMPLETED,
      performedDate,
      inspectorId: userId,
      criticalFindings: input.criticalFindings ?? 0,
    }
    if (input.overallCondition) data.overallCondition = input.overallCondition
    if (input.score != null) data.score = input.score
    if (input.payload !== undefined) data.payload = input.payload
    if (input.notes?.trim()) data.notes = input.notes.trim()

    const [inspection] = await prisma.$transaction([
      prisma.inspection.update({ where: { id: input.inspectionId }, data, include: inspectionInclude }),
      prisma.unit.update({ where: { id: existing.unitId }, data: { lastInspectionDate: performedDate } }),
    ])

    revalidatePath('/dashboard/admin/inspections')
    return { success: true, data: inspection }
  } catch (error) {
    console.error('Error completing inspection:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al completar inspección' }
  }
}

export const cancelInspectionAction = async (input: { inspectionId: string }) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const existing = await prisma.inspection.findUnique({
      where: { id: input.inspectionId },
      select: { unitId: true },
    })
    if (!existing) return { success: false, error: 'Inspección no encontrada' }

    const guard = await requireAdminForUnit(existing.unitId)
    if ('error' in guard) return { success: false, error: guard.error }

    const inspection = await prisma.inspection.update({
      where: { id: input.inspectionId },
      data: { status: InspectionStatus.CANCELLED },
      include: inspectionInclude,
    })

    revalidatePath('/dashboard/admin/inspections')
    return { success: true, data: inspection }
  } catch (error) {
    console.error('Error cancelling inspection:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al cancelar inspección' }
  }
}
