import { Prisma, PrismaClient, PropertyStatus, PropertyType, UnitStatus } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

export class UnitsManager {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    this.prisma = prisma
  }

  async getAvailableUnits(filters?: {
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
  }) {
    try {
      const where: Prisma.UnitWhereInput = { status: UnitStatus.VACANT }

      // Filtros directos del modelo Unit
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

      // Filtros de la propiedad relacionada
      if (filters?.city || filters?.neighborhood || filters?.propertyType) {
        where.property = {}
        if (filters.city) where.property.city = filters.city
        if (filters.neighborhood) where.property.neighborhood = filters.neighborhood
        if (filters.propertyType) where.property.propertyType = filters.propertyType
      }

      return await this.prisma.unit.findMany({
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
    } catch (error) {
      throw error
    }
  }

  async getUnitById({ id }: { id: string }) {
    try {
      return await this.prisma.unit.findUnique({
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
    } catch (error) {
      throw error
    }
  }

  async getPropertiesWithAvailableUnits() {
    try {
      return await this.prisma.property.findMany({
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
    } catch (error) {
      throw error
    }
  }

  async reserveUnit({
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
  }) {
    try {
      // Verificar que la unidad esté disponible
      const unit = await this.prisma.unit.findUnique({
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

      // Cambiar estado a RESERVED
      const updatedUnit = await this.prisma.unit.update({
        where: { id: unitId },
        data: { status: UnitStatus.RESERVED },
        include: {
          property: { select: { name: true, city: true, neighborhood: true } },
        },
      })

      return updatedUnit
    } catch (error) {
      throw error
    }
  }

  async getUnitsByProperty({ propertyId }: { propertyId: string }) {
    try {
      return await this.prisma.unit.findMany({
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
    } catch (error) {
      throw error
    }
  }
}

export const unitsManager = new UnitsManager(new PrismaClient())

export type UnitWithRelations = Prisma.PromiseReturnType<typeof UnitsManager.prototype.getUnitById>
export type AvailableUnit = Prisma.PromiseReturnType<typeof UnitsManager.prototype.getAvailableUnits>[0]
export type PropertyWithAvailableUnits = Prisma.PromiseReturnType<
  typeof UnitsManager.prototype.getPropertiesWithAvailableUnits
>[0]
