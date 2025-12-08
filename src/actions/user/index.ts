'use server'

import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'
import { userSafeSelect, type UserTenant } from './types'

export const getUserTenant = async (): Promise<UserTenant | null> => {
  const session = await auth()

  if (!session?.user.id) return null

  try {
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        ...userSafeSelect,
        tenant: {
          include: {
            contracts: {
              include: {
                unit: true,
                payments: true,
                admins: { select: { id: true, userId: true, user: { select: userSafeSelect } } },
                additionalResidents: true,
              },
            },
          },
        },
      },
    })
  } catch (error) {
    console.error('Error fetching tenant by ID:', error)
    throw error
  }
}
