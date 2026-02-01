'use server'

import { DocumentType, MaritalStatus, Prisma, ContractStatus, Profile } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { prisma } from '+/lib/prisma'
import { CreateTenantSubmit } from '+/app/dashboard/admin/nuevo-proceso/seleccion-de-usuario/CreateTenantForm'

const toProfile = (value?: string): Profile | undefined =>
  value && Object.values(Profile).includes(value as Profile) ? (value as Profile) : undefined

export const getTenantsAction = async (filters?: {
  search?: string
  city?: string
  documentType?: DocumentType
  profile?: string
  page?: number
  pageSize?: number
}) => {
  try {
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const skip = (page - 1) * pageSize

    const tenants = await prisma.tenant.findMany({
      where: {
        ...(filters?.profile &&
          toProfile(filters.profile) && {
            profile: toProfile(filters.profile),
          }),
        user: {
          is: {
            deletedAt: null,
            ...(filters?.city && { city: filters.city }),
            ...(filters?.documentType && { documentType: filters.documentType }),
            ...(filters?.search && {
              OR: [
                { name: { contains: filters.search } },
                { lastName: { contains: filters.search } },
                { email: { contains: filters.search } },
                { documentNumber: { contains: filters.search } },
              ],
            }),
          },
        },
      },
      include: {
        user: true,
        references: true,
        contracts: {
          where: { status: { in: [ContractStatus.ACTIVE, ContractStatus.PENDING] } },
          include: {
            unit: { include: { property: { select: { name: true, city: true, neighborhood: true } } } },
          },
        },
      },
      orderBy: [{ user: { lastName: 'asc' } }, { user: { name: 'asc' } }],
      skip,
      take: pageSize,
    })

    return { success: true, data: tenants }
  } catch (error) {
    console.error('Error en getTenantsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener inquilinos',
    }
  }
}

export type TenantListItem = NonNullable<Awaited<ReturnType<typeof getTenantsAction>>['data']>[number]

export const getTenantByIdAction = async (tenantId: string) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
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

    if (!tenant) return { success: false, error: 'Inquilino no encontrado' }

    return { success: true, data: tenant }
  } catch (error) {
    console.error('Error en getTenantByIdAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener el inquilino',
    }
  }
}

export const createTenantAction = async (tenantData: CreateTenantSubmit) => {
  try {
    const { user, tenant, references } = tenantData
    const profileValue = toProfile(tenant.profile)

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: user.email }, { documentNumber: user.documentNumber }] },
    })

    if (existingUser) throw new Error('Ya existe un usuario con ese email o número de documento')

    const result = await prisma.tenant.create({
      data: {
        profile: profileValue,
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

    revalidatePath('/dashboard/tenants')

    return {
      success: true,
      data: result,
      message: 'Inquilino creado exitosamente',
    }
  } catch (error) {
    console.error('Error en createTenantAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear el inquilino',
    }
  }
}

export const updateTenantAction = async (
  tenantId: string,
  updateData: {
    name?: string
    lastName?: string
    phone?: string
    birthDate?: string
    address?: string
    city?: string
    state?: string
    profession?: string
    maritalStatus?: MaritalStatus
    emergencyContact?: string
    emergencyContactPhone?: string
    profile?: string
    monthlyIncome?: number
  }
) => {
  try {
    const userData = {
      name: updateData.name,
      lastName: updateData.lastName,
      phone: updateData.phone,
      birthDate: updateData.birthDate ? new Date(updateData.birthDate) : undefined,
      address: updateData.address,
      city: updateData.city,
      state: updateData.state,
      profession: updateData.profession,
      maritalStatus: updateData.maritalStatus,
    }

    const tenantData = {
      emergencyContact: updateData.emergencyContact,
      emergencyContactPhone: updateData.emergencyContactPhone,
      profile: updateData.profile,
      monthlyIncome: updateData.monthlyIncome,
    }

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.findUnique({
        where: { id: tenantId },
        select: { userId: true },
      })
      if (!tenant) throw new Error('Tenant no encontrado')

      const profileUpdate = toProfile(tenantData.profile)

      const userUpdateData: Prisma.UserUpdateInput = {
        ...(userData.name !== undefined && { name: userData.name }),
        ...(userData.lastName !== undefined && { lastName: userData.lastName }),
        ...(userData.phone !== undefined && { phone: userData.phone }),
        ...(userData.birthDate !== undefined && { birthDate: userData.birthDate }),
        ...(userData.address !== undefined && { address: userData.address }),
        ...(userData.city !== undefined && { city: userData.city }),
        ...(userData.state !== undefined && { state: userData.state }),
        ...(userData.profession !== undefined && { profession: userData.profession }),
        ...(userData.maritalStatus !== undefined && { maritalStatus: userData.maritalStatus }),
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
        ...(profileUpdate !== undefined && { profile: profileUpdate }),
        ...(tenantData.monthlyIncome !== undefined && { monthlyIncome: tenantData.monthlyIncome }),
      }

      const updatedTenant = await tx.tenant.update({
        where: { id: tenantId },
        data: tenantUpdateData,
      })

      return { user: updatedUser, tenant: updatedTenant }
    })

    revalidatePath('/dashboard/tenants')
    revalidatePath(`/dashboard/tenants/${tenantId}`)

    return {
      success: true,
      data: result,
      message: 'Inquilino actualizado exitosamente',
    }
  } catch (error) {
    console.error('Error en updateTenantAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el inquilino',
    }
  }
}

export const disableTenantAction = async (tenantId: string) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { userId: true },
    })

    if (!tenant) {
      throw new Error('Tenant no encontrado')
    }

    await prisma.user.update({
      where: { id: tenant.userId },
      data: {
        disable: true,
        deletedAt: new Date(),
      },
    })

    revalidatePath('/dashboard/tenants')

    return {
      success: true,
      message: 'Inquilino deshabilitado exitosamente',
    }
  } catch (error) {
    console.error('Error en disableTenantAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al deshabilitar el inquilino',
    }
  }
}

export const getTenantsStatsAction = async () => {
  try {
    const stats = await prisma.tenant.aggregate({
      _count: true,
      where: {
        user: {
          deletedAt: null,
        },
      },
    })

    const activeContracts = await prisma.contract.count({
      where: {
        status: 'ACTIVE',
      },
    })

    const citiesDistribution = await prisma.user.groupBy({
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

    const data = {
      totalTenants: stats._count,
      activeContracts,
      citiesDistribution,
    }

    return { success: true, data }
    return { success: true, data: stats }
  } catch (error) {
    console.error('Error en getTenantsStatsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
    }
  }
}
