'use server'

import { revalidatePath } from 'next/cache'
import { Prisma, SecurityDeviceType } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

const deviceInclude = {
  property: { select: { id: true, name: true } },
  unit: { select: { id: true, unitNumber: true } },
} satisfies Prisma.SecurityDeviceInclude

export type SecurityDeviceRow = Prisma.SecurityDeviceGetPayload<{ include: typeof deviceInclude }>

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

export const getAdminSecurityDevices = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.securityDevice.findMany({
    where: { property: { admins: { some: { id: admin.id } } } },
    include: deviceInclude,
    orderBy: [{ property: { name: 'asc' } }, { type: 'asc' }],
  })
}

export type AdminSecurityDeviceRow = Awaited<ReturnType<typeof getAdminSecurityDevices>>[0]

export const createSecurityDeviceAction = async (input: {
  propertyId: string
  type: SecurityDeviceType
  unitId?: string
  location?: string
  brand?: string
  nextServiceDate?: string
}) => {
  const guard = await requireAdminForProperty(input.propertyId)
  if ('error' in guard) return { success: false, error: guard.error }

  if (input.unitId) {
    const unit = await prisma.unit.findFirst({
      where: { id: input.unitId, propertyId: input.propertyId },
      select: { id: true },
    })
    if (!unit) return { success: false, error: 'La unidad no pertenece a la propiedad' }
  }

  try {
    const device = await prisma.securityDevice.create({
      data: {
        propertyId: input.propertyId,
        unitId: input.unitId || null,
        type: input.type,
        location: input.location?.trim() || null,
        brand: input.brand?.trim() || null,
        nextServiceDate: input.nextServiceDate ? new Date(input.nextServiceDate) : null,
      },
      include: deviceInclude,
    })

    revalidatePath('/dashboard/admin/security')
    return { success: true, data: device }
  } catch (error) {
    console.error('Error creating security device:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear dispositivo' }
  }
}

export const toggleSecurityDeviceActiveAction = async (input: { deviceId: string; active: boolean }) => {
  try {
    const device = await prisma.securityDevice.findUnique({ where: { id: input.deviceId }, select: { propertyId: true } })
    if (!device) return { success: false, error: 'Dispositivo no encontrado' }

    const guard = await requireAdminForProperty(device.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    const updated = await prisma.securityDevice.update({
      where: { id: input.deviceId },
      data: { active: input.active },
      include: deviceInclude,
    })

    revalidatePath('/dashboard/admin/security')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Error toggling device:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar dispositivo' }
  }
}

export const deleteSecurityDeviceAction = async (input: { deviceId: string }) => {
  try {
    const device = await prisma.securityDevice.findUnique({ where: { id: input.deviceId }, select: { propertyId: true } })
    if (!device) return { success: false, error: 'Dispositivo no encontrado' }

    const guard = await requireAdminForProperty(device.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    await prisma.securityDevice.delete({ where: { id: input.deviceId } })

    revalidatePath('/dashboard/admin/security')
    return { success: true }
  } catch (error) {
    console.error('Error deleting device:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar dispositivo' }
  }
}
