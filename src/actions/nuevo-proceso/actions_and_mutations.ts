'use server'

import { revalidatePath } from 'next/cache'
import { Prisma, PropertyStatus, PropertyType, UnitStatus } from '@prisma/client'
import { prisma } from '+/lib/prisma'

export const getAvailableUnits = async (filters?: {
  propertyId?: string
  minRent?: number
  maxRent?: number
  bedrooms?: number
  bathrooms?: number
  furnished?: boolean
  petFriendly?: boolean
  smokingAllowed?: boolean
  parking?: boolean
  balcony?: boolean
  city?: string
  neighborhood?: string
  propertyType?: PropertyType
}) => {
  const where: Prisma.UnitWhereInput = { status: UnitStatus.VACANT }

  if (filters?.propertyId) where.propertyId = filters.propertyId

  if (filters?.minRent != null || filters?.maxRent != null) {
    where.baseRent = {}
    if (filters.minRent != null) where.baseRent.gte = filters.minRent
    if (filters.maxRent != null) where.baseRent.lte = filters.maxRent
  }

  if (filters?.bedrooms !== undefined) where.bedrooms = filters.bedrooms
  if (filters?.bathrooms !== undefined) where.bathrooms = filters.bathrooms
  if (filters?.furnished !== undefined) where.furnished = filters.furnished
  if (filters?.petFriendly !== undefined) where.petFriendly = filters.petFriendly
  if (filters?.smokingAllowed !== undefined) where.smokingAllowed = filters.smokingAllowed
  if (filters?.parking !== undefined) where.parking = filters.parking
  if (filters?.balcony !== undefined) where.balcony = filters.balcony

  if (filters?.city || filters?.neighborhood || filters?.propertyType) {
    where.property = {}
    if (filters.city) where.property.city = filters.city
    if (filters.neighborhood) where.property.neighborhood = filters.neighborhood
    if (filters.propertyType) where.property.propertyType = filters.propertyType
  }

  return prisma.unit.findMany({
    where,
    include: {
      property: {
        include: {
          admin: { include: { user: true } },
        },
      },
    },
    orderBy: [
      { property: { city: 'asc' } },
      { property: { neighborhood: 'asc' } },
      { property: { name: 'asc' } },
      { unitNumber: 'asc' },
    ],
  })
}

export const getUnitById = async ({ id }: { id: string }) =>
  prisma.unit.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          admin: { include: { user: true } },
        },
      },
      contracts: {
        include: {
          payments: true,
          admins: { include: { user: true } },
          tenant: { include: { user: true } },
          additionalResidents: true,
        },
      },
    },
  })

export const getPropertiesWithAvailableUnits = async () =>
  prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      units: { some: { status: UnitStatus.VACANT } },
    },
    select: {
      id: true,
      name: true,
      city: true,
      neighborhood: true,
      propertyType: true,
      street: true,
      number: true,
      _count: {
        select: {
          units: { where: { status: UnitStatus.VACANT } },
        },
      },
    },
    orderBy: [{ city: 'asc' }, { neighborhood: 'asc' }, { name: 'asc' }],
  })

export const reserveUnit = async ({
  unitId,
  tenantData,
}: {
  unitId: string
  tenantData: {
    tenantName: string
    tenantEmail: string
    startDate: Date
    notes?: string
  }
}) => {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: {
      id: true,
      status: true,
      unitNumber: true,
      property: { select: { name: true } },
    },
  })

  if (!unit) throw new Error('Unidad no encontrada')
  if (unit.status !== UnitStatus.VACANT) throw new Error('La unidad no está disponible para reservar')

  const updatedUnit = await prisma.unit.update({
    where: { id: unitId },
    data: { status: UnitStatus.RESERVED },
    include: {
      property: { select: { name: true, city: true, neighborhood: true } },
    },
  })

  return updatedUnit
}

export const getUnitsByProperty = async ({ propertyId }: { propertyId: string }) =>
  prisma.unit.findMany({
    where: { propertyId, status: UnitStatus.VACANT },
    include: {
      property: {
        select: {
          name: true,
          city: true,
          neighborhood: true,
          street: true,
          number: true,
        },
      },
    },
    orderBy: [{ floor: 'asc' }, { unitNumber: 'asc' }],
  })

export type UnitWithRelations = Prisma.PromiseReturnType<typeof getUnitById>
export type AvailableUnit = Prisma.PromiseReturnType<typeof getAvailableUnits>[0]
export type PropertyWithAvailableUnits = Prisma.PromiseReturnType<typeof getPropertiesWithAvailableUnits>[0]

export const getAvailableUnitsAction = async (filters?: {
  propertyId?: string
  minRent?: number
  maxRent?: number
  bedrooms?: number
  bathrooms?: number
  furnished?: boolean
  petFriendly?: boolean
  smokingAllowed?: boolean
  parking?: boolean
  balcony?: boolean
  city?: string
  neighborhood?: string
  propertyType?: PropertyType
}) => {
  try {
    const units = await getAvailableUnits(filters)
    return { success: true, data: units }
  } catch (error) {
    console.error('Error en getAvailableUnitsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener unidades disponibles',
    }
  }
}

export const getUnitByIdAction = async (unitId: string) => {
  try {
    const unit = await getUnitById({ id: unitId })

    if (!unit) {
      return { success: false, error: 'Unidad no encontrada' }
    }

    return { success: true, data: unit }
  } catch (error) {
    console.error('Error en getUnitByIdAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener la unidad',
    }
  }
}

export const getPropertiesWithAvailableUnitsAction = async () => {
  try {
    const properties = await getPropertiesWithAvailableUnits()
    return { success: true, data: properties }
  } catch (error) {
    console.error('Error en getPropertiesWithAvailableUnitsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener propiedades',
    }
  }
}

export const reserveUnitAction = async (
  unitId: string,
  tenantData: {
    tenantName: string
    tenantEmail: string
    startDate: Date
    notes?: string
  }
) => {
  try {
    const reservedUnit = await reserveUnit({ unitId, tenantData })

    // No usar la cache
    revalidatePath('/dashboard/units')
    revalidatePath('/dashboard/properties')

    return {
      success: true,
      data: reservedUnit,
      message: 'Unidad reservada exitosamente',
    }
  } catch (error) {
    console.error('Error en reserveUnitAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reservar la unidad',
    }
  }
}

export const getUnitsByPropertyAction = async (propertyId: string) => {
  try {
    const units = await getUnitsByProperty({ propertyId })
    return { success: true, data: units }
  } catch (error) {
    console.error('Error en getUnitsByPropertyAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener unidades de la propiedad',
    }
  }
}
