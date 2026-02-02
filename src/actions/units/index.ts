'use server'

import { Prisma, UnitStatus } from '@prisma/client'
import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'

export const getAdminUnits = async (filters?: { status?: UnitStatus; propertyId?: string; city?: string }) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) throw new Error('No autenticado')

  const admin = await prisma.admin.findFirst({
    where: { userId },
    select: { id: true },
  })
  if (!admin?.id) throw new Error('No se encontró administrador')

  const where: Prisma.UnitWhereInput = {
    property: { adminId: admin.id },
  }

  if (filters?.status) where.status = filters.status
  if (filters?.propertyId) where.propertyId = filters.propertyId
  if (filters?.city) where.property = { ...where.property, city: filters.city }

  return prisma.unit.findMany({
    where,
    include: {
      property: true,
      _count: { select: { contracts: true } },
      contracts: {
        include: {
          tenant: { include: { user: true } },
        },
        orderBy: { startDate: 'desc' },
        take: 1,
      },
    },
    orderBy: [{ property: { city: 'asc' } }, { property: { name: 'asc' } }, { unitNumber: 'asc' }],
  })
}

export type AdminUnitRow = Prisma.PromiseReturnType<typeof getAdminUnits>[0]

export const getAdminUnitsAction = async (filters?: { status?: UnitStatus; propertyId?: string; city?: string }) => {
  try {
    const units = await getAdminUnits(filters)
    return { success: true, data: units }
  } catch (error) {
    console.error('Error fetching admin units:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener unidades',
    }
  }
}
