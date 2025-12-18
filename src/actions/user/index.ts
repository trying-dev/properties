'use server'

import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'

const userSafeSelect = {
  id: true,
  email: true,
  emailVerified: true,
  phone: true,
  phoneVerified: true,
  name: true,
  lastName: true,
  birthDate: true,
  birthPlace: true,
  address: true,
  city: true,
  state: true,
  country: true,
  postalCode: true,
  documentType: true,
  documentNumber: true,
  gender: true,
  maritalStatus: true,
  profession: true,
  applicationProfile: true,
  profileImage: true,
  disable: true,
  timezone: true,
  language: true,
  emailNotifications: true,
  smsNotifications: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
} as const

export type UserSafeSelect = typeof userSafeSelect

export const getUserTenant = async () => {
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

export type UserTenant = NonNullable<Awaited<ReturnType<typeof getUserTenant>>>
