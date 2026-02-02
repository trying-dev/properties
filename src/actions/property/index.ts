'use server'

import { Prisma, PropertyType, UnitStatus } from '@prisma/client'
import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'

export const getProperties = async () => {
  try {
    return await prisma.property.findMany()
  } catch (error) {
    console.error('Error fetching properties:', error)
    throw error
  }
}

export const getProperty = async ({ id }: { id: string }) => {
  try {
    return prisma.property.findUnique({
      where: { id },
      include: {
        admin: { include: { user: true } },
        units: {
          include: {
            contracts: {
              include: {
                payments: true,
                admins: { include: { user: true } },
                tenant: { include: { user: true } },
                additionalResidents: true,
              },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching property by ID:', error)
    throw error
  }
}

export type PropertyWithRelations = Prisma.PromiseReturnType<typeof getProperty>

export const getPropertyLite = async ({ id }: { id: string }) => {
  try {
    return prisma.property.findUnique({
      where: { id },
    })
  } catch (error) {
    console.error('Error fetching property by ID:', error)
    throw error
  }
}

export type PropertyLite = Prisma.PromiseReturnType<typeof getPropertyLite>

export const getPropertyWithUnits = async ({ id }: { id: string }) => {
  try {
    return prisma.property.findUnique({
      where: { id },
      include: {
        units: true,
      },
    })
  } catch (error) {
    console.error('Error fetching property with units:', error)
    throw error
  }
}

export type PropertyWithUnits = Prisma.PromiseReturnType<typeof getPropertyWithUnits>

export type CreatePropertyInput = {
  name: string
  description?: string | null
  street: string
  number: string
  city: string
  neighborhood: string
  state: string
  postalCode: string
  country?: string | null
  propertyType: PropertyType
  builtArea: number
  age: number
  floors?: number
  totalLandArea?: number | null
  gpsCoordinates?: string | null
  yardOrGarden?: string | null
  parking?: number
  parkingLocation?: string | null
  balconiesAndTerraces?: string | null
  recreationalAreas?: string | null
  commonZones?: string | null
}

export type CreateUnitInput = {
  propertyId: string
  unitNumber: string
  floor?: number | null
  area?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  furnished?: boolean | null
  balcony?: boolean | null
  parking?: boolean | null
  storage?: boolean | null
  petFriendly?: boolean | null
  smokingAllowed?: boolean | null
  internet?: boolean | null
  cableTV?: boolean | null
  waterIncluded?: boolean | null
  gasIncluded?: boolean | null
  status?: UnitStatus | null
  baseRent?: number | null
  deposit?: number | null
  description?: string | null
  images?: string | null
  highlights?: Prisma.InputJsonValue | null
  lastInspectionDate?: Date | null
}

export const createPropertyAction = async (input: CreatePropertyInput) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const admin = await prisma.admin.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (!admin?.id) return { success: false, error: 'No se encontró administrador' }

    const data: Prisma.PropertyUncheckedCreateInput = {
      adminId: admin.id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      street: input.street.trim(),
      number: input.number.trim(),
      city: input.city.trim(),
      neighborhood: input.neighborhood.trim(),
      state: input.state.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country?.trim() || 'Colombia',
      propertyType: input.propertyType,
      builtArea: input.builtArea,
      age: input.age,
      floors: input.floors ?? 1,
      totalLandArea: input.totalLandArea ?? null,
      gpsCoordinates: input.gpsCoordinates?.trim() || null,
      yardOrGarden: input.yardOrGarden?.trim() || null,
      parking: input.parking ?? 0,
      parkingLocation: input.parkingLocation?.trim() || null,
      balconiesAndTerraces: input.balconiesAndTerraces?.trim() || null,
      recreationalAreas: input.recreationalAreas?.trim() || null,
      commonZones: input.commonZones?.trim() || null,
    }

    const property = await prisma.property.create({
      data,
      select: { id: true },
    })

    return { success: true, data: property }
  } catch (error) {
    console.error('Error creating property:', error)
    return { success: false, error: 'No se pudo crear la propiedad' }
  }
}

export const createUnitAction = async (input: CreateUnitInput) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const admin = await prisma.admin.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (!admin?.id) return { success: false, error: 'No se encontró administrador' }

    const property = await prisma.property.findFirst({
      where: { id: input.propertyId, adminId: admin.id },
      select: { id: true },
    })
    if (!property) return { success: false, error: 'Propiedad no encontrada' }

    await prisma.unit.create({
      data: {
        propertyId: input.propertyId,
        unitNumber: input.unitNumber.trim(),
        floor: input.floor ?? null,
        area: input.area ?? null,
        bedrooms: input.bedrooms ?? 0,
        bathrooms: input.bathrooms ?? 0,
        furnished: input.furnished ?? false,
        balcony: input.balcony ?? false,
        parking: input.parking ?? false,
        storage: input.storage ?? false,
        petFriendly: input.petFriendly ?? false,
        smokingAllowed: input.smokingAllowed ?? false,
        internet: input.internet ?? false,
        cableTV: input.cableTV ?? false,
        waterIncluded: input.waterIncluded ?? false,
        gasIncluded: input.gasIncluded ?? false,
        status: input.status ?? UnitStatus.VACANT,
        baseRent: input.baseRent ?? null,
        deposit: input.deposit ?? null,
        description: input.description?.trim() || null,
        images: input.images ?? '[]',
        highlights: input.highlights ?? null,
        lastInspectionDate: input.lastInspectionDate ?? null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error creating unit:', error)
    return { success: false, error: 'No se pudo crear la unidad' }
  }
}

export const updatePropertyAction = async (propertyId: string, input: CreatePropertyInput) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const admin = await prisma.admin.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (!admin?.id) return { success: false, error: 'No se encontró administrador' }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, adminId: admin.id },
      select: { id: true },
    })
    if (!property) return { success: false, error: 'Propiedad no encontrada' }

    const data: Prisma.PropertyUncheckedUpdateInput = {
      name: input.name.trim(),
      description: input.description?.trim() || null,
      street: input.street.trim(),
      number: input.number.trim(),
      city: input.city.trim(),
      neighborhood: input.neighborhood.trim(),
      state: input.state.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country?.trim() || 'Colombia',
      propertyType: input.propertyType,
      builtArea: input.builtArea,
      age: input.age,
      floors: input.floors ?? 1,
      totalLandArea: input.totalLandArea ?? null,
      gpsCoordinates: input.gpsCoordinates?.trim() || null,
      yardOrGarden: input.yardOrGarden?.trim() || null,
      parking: input.parking ?? 0,
      parkingLocation: input.parkingLocation?.trim() || null,
      balconiesAndTerraces: input.balconiesAndTerraces?.trim() || null,
      recreationalAreas: input.recreationalAreas?.trim() || null,
      commonZones: input.commonZones?.trim() || null,
    }

    await prisma.property.update({
      where: { id: propertyId },
      data,
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating property:', error)
    return { success: false, error: 'No se pudo actualizar la propiedad' }
  }
}

export const deletePropertyAction = async (propertyId: string) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { success: false, error: 'No autenticado' }

  try {
    const admin = await prisma.admin.findFirst({
      where: { userId },
      select: { id: true },
    })
    if (!admin?.id) return { success: false, error: 'No se encontró administrador' }

    const property = await prisma.property.findFirst({
      where: { id: propertyId, adminId: admin.id },
      select: { id: true },
    })
    if (!property) return { success: false, error: 'Propiedad no encontrada' }

    await prisma.property.delete({
      where: { id: propertyId },
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting property:', error)
    return { success: false, error: 'No se pudo eliminar la propiedad' }
  }
}
