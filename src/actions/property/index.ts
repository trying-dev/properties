'use server'

import { Prisma, PropertyType } from '@prisma/client'
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

type CreatePropertyInput = {
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
