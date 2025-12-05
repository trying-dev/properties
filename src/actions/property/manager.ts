import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

export class PropertyManager {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    this.prisma = prisma
  }

  async getProperties() {
    try {
      return await this.prisma.property.findMany()
    } catch (error) {
      throw error
    }
  }

  async getProperty({ id }: { id: string }) {
    try {
      return await this.prisma.property.findUnique({
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
      throw error
    }
  }
}

export const propertyManager = new PropertyManager(new PrismaClient())

export type PropertyWithRelations = Prisma.PromiseReturnType<typeof PropertyManager.prototype.getProperty>
