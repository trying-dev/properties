'use server'

import { Prisma, UnitStatus } from '+/generated/prisma/client'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import { prisma } from '+/lib/prisma'

export const getAdminUnits = async (filters?: { status?: UnitStatus; propertyId?: string; city?: string }) => {
  const scope = await getCurrentAdminScope()
  if (!scope) return []

  const where: Prisma.UnitWhereInput = {
    property: { is: { ...propertyAccessFilter(scope), ...(filters?.city ? { city: filters.city } : {}) } },
  }

  if (filters?.status) where.status = filters.status
  if (filters?.propertyId) where.propertyId = filters.propertyId

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

export type AdminUnitRow = Awaited<ReturnType<typeof getAdminUnits>>[0]

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

export const getUnitsCount = async () => {
  const scope = await getCurrentAdminScope()
  if (!scope) return 0

  return prisma.unit.count({ where: { property: { is: propertyAccessFilter(scope) } } })
}
