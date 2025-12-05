import { Prisma, PrismaClient } from '@prisma/client'

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
}

export class UserManager {
  prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  findByEmail = async (email: string) =>
    await this.prisma.user.findUnique({
      where: { email },
      include: { admin: true, tenant: true },
    })

  updateLastLogin = async (id: string) =>
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })

  getUserTenant = async (id: string) =>
    await this.prisma.user.findUnique({
      where: { id },
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
}

export const userManager = new UserManager(new PrismaClient())

export type UserTenant = Prisma.PromiseReturnType<typeof UserManager.prototype.getUserTenant>
