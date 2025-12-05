import { CreateTenantSubmit } from '+/app/dashboard/admin/nuevo-proceso/seleccion-de-usuario/CreateTenantForm'
import {
  ContractStatus,
  EmploymentStatus,
  MaritalStatus,
  Prisma,
  PrismaClient,
  DocumentType,
  Gender,
} from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'

const toEmploymentStatus = (status?: string): EmploymentStatus | undefined =>
  status && Object.values(EmploymentStatus).includes(status as EmploymentStatus)
    ? (status as EmploymentStatus)
    : undefined

export class TenantsManager {
  prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>

  constructor(prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) {
    this.prisma = prisma
  }

  async getTenants(filters?: {
    search?: string
    city?: string
    documentType?: DocumentType
    employmentStatus?: string
    skip?: number
    take?: number
  }) {
    try {
      const { search, city, documentType, employmentStatus, skip = 0, take = 50 } = filters ?? {}

      const safeTake = Math.min(Math.max(take, 1), 100)

      const employmentStatusFilter = toEmploymentStatus(employmentStatus)

      const userWhere: Prisma.UserWhereInput = {
        deletedAt: null,
        ...(city && { city }),
        ...(documentType && { documentType }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { lastName: { contains: search } },
            { email: { contains: search } },
            { documentNumber: { contains: search } },
          ],
        }),
      }

      const where: Prisma.TenantWhereInput = {
        ...(employmentStatusFilter && { employmentStatus: employmentStatusFilter }),
        user: { is: userWhere },
      }

      const tenants = await this.prisma.tenant.findMany({
        where,
        include: {
          user: true,
          references: true,
          contracts: {
            where: { status: { in: [ContractStatus.ACTIVE, ContractStatus.PENDING] } },
            include: {
              unit: {
                include: {
                  property: {
                    select: { name: true, city: true, neighborhood: true },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ user: { lastName: 'asc' } }, { user: { name: 'asc' } }],
        skip,
        take: safeTake,
      })

      return tenants
    } catch (error) {
      throw error
    }
  }

  async getTenantById({ id }: { id: string }) {
    try {
      return await this.prisma.tenant.findUnique({
        where: { id },
        include: {
          user: true,
          references: true,
          contracts: {
            include: {
              unit: {
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
              },
              payments: {
                orderBy: { dueDate: 'desc' },
                take: 5,
              },
            },
          },
        },
      })
    } catch (error) {
      throw error
    }
  }

  async createTenant(payload: CreateTenantSubmit) {
    const { user, tenant, references } = payload

    console.log({ user })
    const employmentStatusValue = toEmploymentStatus(tenant.employmentStatus)

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: user.email }, { documentNumber: user.documentNumber }] },
    })

    if (existingUser) throw new Error('Ya existe un usuario con ese email o número de documento')

    const newTenant = await this.prisma.tenant.create({
      data: {
        employmentStatus: employmentStatusValue,
        monthlyIncome: tenant.monthlyIncome,
        emergencyContact: tenant.emergencyContact,
        emergencyContactPhone: tenant.emergencyContactPhone,
        user: { create: { ...user } },
        references:
          references.length > 0
            ? {
                create: references.map((ref) => ({
                  name: ref.name,
                  phone: ref.phone,
                  relationship: ref.relationship,
                })),
              }
            : undefined,
      },
      include: { user: true, references: true },
    })

    return newTenant
  }

  async updateTenant({
    tenantId,
    userData,
    tenantData,
  }: {
    tenantId: string
    userData: Partial<{
      name: string
      lastName: string
      phone: string
      birthDate: Date
      address: string
      city: string
      state: string
      profession: string
      maritalStatus: MaritalStatus
    }>
    tenantData: Partial<{
      emergencyContact: string
      emergencyContactPhone: string
      employmentStatus: string
      monthlyIncome: number
    }>
  }) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.findUnique({
          where: { id: tenantId },
          select: { userId: true },
        })
        if (!tenant) throw new Error('Tenant no encontrado')

        const employmentStatusUpdate = toEmploymentStatus(tenantData.employmentStatus)

        const userUpdateData: Prisma.UserUpdateInput = {
          ...(userData.name !== undefined && { name: userData.name }),
          ...(userData.lastName !== undefined && { lastName: userData.lastName }),
          ...(userData.phone !== undefined && { phone: userData.phone }),
          ...(userData.birthDate !== undefined && { birthDate: userData.birthDate }),
          ...(userData.address !== undefined && { address: userData.address }),
          ...(userData.city !== undefined && { city: userData.city }),
          ...(userData.state !== undefined && { state: userData.state }),
          ...(userData.profession !== undefined && { profession: userData.profession }),
          ...(userData.maritalStatus !== undefined && { maritalStatus: userData.maritalStatus }), // enum OK
        }

        const updatedUser = await tx.user.update({
          where: { id: tenant.userId },
          data: userUpdateData,
        })

        const tenantUpdateData: Prisma.TenantUpdateInput = {
          ...(tenantData.emergencyContact !== undefined && { emergencyContact: tenantData.emergencyContact }),
          ...(tenantData.emergencyContactPhone !== undefined && {
            emergencyContactPhone: tenantData.emergencyContactPhone,
          }),
          ...(employmentStatusUpdate !== undefined && { employmentStatus: employmentStatusUpdate }),
          ...(tenantData.monthlyIncome !== undefined && { monthlyIncome: tenantData.monthlyIncome }),
        }

        const updatedTenant = await tx.tenant.update({
          where: { id: tenantId },
          data: tenantUpdateData,
        })

        return { user: updatedUser, tenant: updatedTenant }
      })

      return result
    } catch (error) {
      throw error
    }
  }

  async disableTenant({ tenantId }: { tenantId: string }) {
    try {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { userId: true },
      })

      if (!tenant) {
        throw new Error('Tenant no encontrado')
      }

      return await this.prisma.user.update({
        where: { id: tenant.userId },
        data: {
          disable: true,
          deletedAt: new Date(),
        },
      })
    } catch (error) {
      throw error
    }
  }

  async getTenantsStats() {
    try {
      const stats = await this.prisma.tenant.aggregate({
        _count: true,
        where: {
          user: {
            deletedAt: null,
          },
        },
      })

      const activeContracts = await this.prisma.contract.count({
        where: {
          status: 'ACTIVE',
        },
      })

      const citiesDistribution = await this.prisma.user.groupBy({
        by: ['city'],
        _count: true,
        where: {
          deletedAt: null,
          tenant: {
            isNot: null,
          },
        },
        orderBy: {
          _count: {
            city: 'desc',
          },
        },
        take: 5,
      })

      return {
        totalTenants: stats._count,
        activeContracts,
        citiesDistribution,
      }
    } catch (error) {
      throw error
    }
  }
}

export const tenantsManager = new TenantsManager(new PrismaClient())

export type TenantWithRelations = Prisma.PromiseReturnType<typeof TenantsManager.prototype.getTenantById>
export type TenantListItem = Prisma.PromiseReturnType<typeof TenantsManager.prototype.getTenants>[0]
