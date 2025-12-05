'use server'

import { DocumentType, MaritalStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { tenantsManager } from './manager'
import { CreateTenantSubmit } from '+/app/dashboard/admin/nuevo-proceso/seleccion-de-usuario/CreateTenantForm'

export const getTenantsAction = async (filters?: {
  search?: string
  city?: string
  documentType?: DocumentType
  employmentStatus?: string
  page?: number
  pageSize?: number
}) => {
  try {
    const page = filters?.page || 1
    const pageSize = filters?.pageSize || 20
    const skip = (page - 1) * pageSize

    const tenants = await tenantsManager.getTenants({
      ...filters,
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

export const getTenantByIdAction = async (tenantId: string) => {
  try {
    const tenant = await tenantsManager.getTenantById({ id: tenantId })

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
    const result = await tenantsManager.createTenant(tenantData)

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
    employmentStatus?: string
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
      employmentStatus: updateData.employmentStatus,
      monthlyIncome: updateData.monthlyIncome,
    }

    const result = await tenantsManager.updateTenant({
      tenantId,
      userData,
      tenantData,
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
    await tenantsManager.disableTenant({ tenantId })

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
    const stats = await tenantsManager.getTenantsStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error('Error en getTenantsStatsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener estadísticas',
    }
  }
}
