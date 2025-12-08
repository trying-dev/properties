import { Prisma } from '@prisma/client'

export const userSafeSelect = {
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
export type UserTenant = Prisma.PromiseReturnType<typeof import('./index').getUserTenant>
