'use server'

import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'
import { serializeDate } from '+/utils'

import { adminSelection, tenantSelection, UserForRedux, userSelection } from './types'
import { Profile } from '@prisma/client'

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
  monthlyIncome: true,
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

export const getUserAfterLogin = async ({ email }: { email: string }) => {
  const normalizedEmail = email?.trim().toLowerCase()
  if (!normalizedEmail) return null

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        ...userSelection,
        admin: { select: adminSelection },
        tenant: { select: tenantSelection },
      },
    })

    if (!user) return null

    const role = user.admin ? 'admin' : 'tenant'

    const serializeDates = {
      emailVerified: serializeDate(user.emailVerified),
      phoneVerified: serializeDate(user.phoneVerified),
      birthDate: serializeDate(user.birthDate),
      createdAt: serializeDate(user.createdAt),
      updatedAt: serializeDate(user.updatedAt),
      deletedAt: serializeDate(user.deletedAt),
      lastLoginAt: serializeDate(user.lastLoginAt),
    }

    const userToReturn: UserForRedux = {
      role,
      ...user,
      ...serializeDates,
    }

    return userToReturn
  } catch (error) {
    console.error('Error fetching user by email:', error)
    throw error
  }
}

export const updateTenantProfile = async ({
  tenantId,
  data,
}: {
  tenantId: string
  data: { profile: Profile | null }
}) => {
  try {
    return await prisma.tenant.update({
      where: { id: tenantId },
      data,
    })
  } catch (error) {
    console.error('Error updating tenant:', error)
    throw error
  }
}

type BasicInfoUpdatePayload = {
  name?: string
  lastName?: string
  phone?: string | null
  birthDate?: string | null
  birthPlace?: string | null
  documentType?: UserForRedux['documentType'] | null
  documentNumber?: string | null
  gender?: UserForRedux['gender'] | null
  maritalStatus?: UserForRedux['maritalStatus'] | null
  profession?: string | null
  monthlyIncome?: string | number | null
}

const normalizeOptionalString = (value?: string | null) => {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const normalizeOptionalDate = (value?: string | null) => {
  if (value == null || value.trim().length === 0) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const normalizeOptionalNumber = (value?: string | number | null) => {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export const updateUserBasicInfo = async ({ data }: { data: BasicInfoUpdatePayload }) => {
  const session = await auth()
  if (!session?.user.id) return null

  const normalizedData = {
    ...(data.name?.trim() ? { name: data.name.trim() } : {}),
    ...(data.lastName?.trim() ? { lastName: data.lastName.trim() } : {}),
    ...(data.phone !== undefined ? { phone: normalizeOptionalString(data.phone) } : {}),
    ...(data.birthDate !== undefined ? { birthDate: normalizeOptionalDate(data.birthDate) } : {}),
    ...(data.birthPlace !== undefined ? { birthPlace: normalizeOptionalString(data.birthPlace) } : {}),
    ...(data.documentType !== undefined ? { documentType: data.documentType || null } : {}),
    ...(data.documentNumber !== undefined
      ? { documentNumber: normalizeOptionalString(data.documentNumber) }
      : {}),
    ...(data.gender !== undefined ? { gender: data.gender || null } : {}),
    ...(data.maritalStatus !== undefined ? { maritalStatus: data.maritalStatus || null } : {}),
    ...(data.profession !== undefined ? { profession: normalizeOptionalString(data.profession) } : {}),
    ...(data.monthlyIncome !== undefined
      ? { monthlyIncome: normalizeOptionalNumber(data.monthlyIncome) }
      : {}),
  }

  try {
    const result = await prisma.user.update({
      where: { id: session.user.id },
      data: normalizedData,
    })

    console.log('updateUserBasicInfo full:', result)
    return result
  } catch (error) {
    console.error('Error updating basic info:', error)
    throw error
  }
}
