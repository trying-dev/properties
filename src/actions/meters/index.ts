'use server'

import { revalidatePath } from 'next/cache'
import { MeterType, Prisma } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

const meterInclude = {
  property: { select: { id: true, name: true } },
  unit: { select: { id: true, unitNumber: true } },
  readings: { orderBy: { readingDate: 'desc' }, take: 12 },
} satisfies Prisma.MeterInclude

export type MeterRow = Prisma.MeterGetPayload<{ include: typeof meterInclude }>

// Admin autenticado que gestiona la propiedad. Devuelve userId o error.
const requireAdminForProperty = async (propertyId: string) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'No autenticado' as const }

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return { error: 'No autorizado' as const }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, admins: { some: { id: admin.id } } },
    select: { id: true },
  })
  if (!property) return { error: 'Propiedad no encontrada' as const }

  return { userId }
}

// Unidades del admin con su propertyId (para filtrar el selector por propiedad).
export const getAdminUnitsWithProperty = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  const units = await prisma.unit.findMany({
    where: { property: { admins: { some: { id: admin.id } } } },
    select: { id: true, unitNumber: true, propertyId: true },
    orderBy: [{ propertyId: 'asc' }, { unitNumber: 'asc' }],
  })

  return units.map((u) => ({ id: u.id, unitNumber: u.unitNumber, propertyId: u.propertyId }))
}

export const getAdminMeters = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.meter.findMany({
    where: { property: { admins: { some: { id: admin.id } } } },
    include: meterInclude,
    orderBy: [{ property: { name: 'asc' } }, { type: 'asc' }],
  })
}

export type AdminMeterRow = Awaited<ReturnType<typeof getAdminMeters>>[0]

export const createMeterAction = async (input: {
  propertyId: string
  type: MeterType
  unitId?: string
  serial?: string
  provider?: string
  unitOfMeasure?: string
}) => {
  const guard = await requireAdminForProperty(input.propertyId)
  if ('error' in guard) return { success: false, error: guard.error }

  // Si se ata a una unidad, debe pertenecer a la propiedad indicada.
  if (input.unitId) {
    const unit = await prisma.unit.findFirst({
      where: { id: input.unitId, propertyId: input.propertyId },
      select: { id: true },
    })
    if (!unit) return { success: false, error: 'La unidad no pertenece a la propiedad' }
  }

  try {
    const meter = await prisma.meter.create({
      data: {
        propertyId: input.propertyId,
        unitId: input.unitId || null,
        type: input.type,
        serial: input.serial?.trim() || null,
        provider: input.provider?.trim() || null,
        unitOfMeasure: input.unitOfMeasure?.trim() || null,
      },
      include: meterInclude,
    })

    revalidatePath('/dashboard/admin/meters')
    return { success: true, data: meter }
  } catch (error) {
    console.error('Error creating meter:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear medidor' }
  }
}

// Registra una lectura. Calcula el consumo = value − última lectura previa del medidor.
export const addMeterReadingAction = async (input: {
  meterId: string
  value: number
  readingDate?: string
  notes?: string
}) => {
  try {
    const meter = await prisma.meter.findUnique({
      where: { id: input.meterId },
      select: { propertyId: true },
    })
    if (!meter) return { success: false, error: 'Medidor no encontrado' }

    const guard = await requireAdminForProperty(meter.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    if (!(input.value >= 0)) return { success: false, error: 'La lectura debe ser un número válido' }

    const readingDate = input.readingDate ? new Date(input.readingDate) : new Date()

    // Lectura previa: la más reciente anterior a esta fecha.
    const previous = await prisma.meterReading.findFirst({
      where: { meterId: input.meterId, readingDate: { lte: readingDate } },
      orderBy: [{ readingDate: 'desc' }, { createdAt: 'desc' }],
      select: { value: true },
    })

    // Consumo solo si hay previa y no retrocede (evita negativos por reinicio/cambio de medidor).
    const consumption = previous && input.value >= previous.value ? input.value - previous.value : null

    const reading = await prisma.meterReading.create({
      data: {
        meterId: input.meterId,
        value: input.value,
        readingDate,
        consumption,
        notes: input.notes?.trim() || null,
      },
    })

    revalidatePath('/dashboard/admin/meters')
    return { success: true, data: reading }
  } catch (error) {
    console.error('Error adding reading:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al registrar lectura' }
  }
}

export const toggleMeterActiveAction = async (input: { meterId: string; active: boolean }) => {
  try {
    const meter = await prisma.meter.findUnique({ where: { id: input.meterId }, select: { propertyId: true } })
    if (!meter) return { success: false, error: 'Medidor no encontrado' }

    const guard = await requireAdminForProperty(meter.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    const updated = await prisma.meter.update({
      where: { id: input.meterId },
      data: { active: input.active },
      include: meterInclude,
    })

    revalidatePath('/dashboard/admin/meters')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Error toggling meter:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar medidor' }
  }
}

export const deleteMeterAction = async (input: { meterId: string }) => {
  try {
    const meter = await prisma.meter.findUnique({ where: { id: input.meterId }, select: { propertyId: true } })
    if (!meter) return { success: false, error: 'Medidor no encontrado' }

    const guard = await requireAdminForProperty(meter.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    await prisma.meter.delete({ where: { id: input.meterId } })

    revalidatePath('/dashboard/admin/meters')
    return { success: true }
  } catch (error) {
    console.error('Error deleting meter:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar medidor' }
  }
}
