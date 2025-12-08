'use server'

import { Prisma } from '@prisma/client'
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
