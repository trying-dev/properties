'use server'

import { revalidatePath } from 'next/cache'
import { unitsManager } from './manager'
import { PropertyType } from '@prisma/client'

export const getAvailableUnitsAction = async (filters?: {
  propertyId?: string
  minRent?: number
  maxRent?: number
  bedrooms?: number
  bathrooms?: number
  furnished?: boolean
  petFriendly?: boolean
  smokingAllowed?: boolean
  parking?: boolean
  balcony?: boolean
  city?: string
  neighborhood?: string
  propertyType?: PropertyType
}) => {
  try {
    const units = await unitsManager.getAvailableUnits(filters)
    return { success: true, data: units }
  } catch (error) {
    console.error('Error en getAvailableUnitsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener unidades disponibles',
    }
  }
}

export const getUnitByIdAction = async (unitId: string) => {
  try {
    const unit = await unitsManager.getUnitById({ id: unitId })

    if (!unit) {
      return { success: false, error: 'Unidad no encontrada' }
    }

    return { success: true, data: unit }
  } catch (error) {
    console.error('Error en getUnitByIdAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener la unidad',
    }
  }
}

export const getPropertiesWithAvailableUnitsAction = async () => {
  try {
    const properties = await unitsManager.getPropertiesWithAvailableUnits()
    return { success: true, data: properties }
  } catch (error) {
    console.error('Error en getPropertiesWithAvailableUnitsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener propiedades',
    }
  }
}

export const reserveUnitAction = async (
  unitId: string,
  tenantData: {
    tenantName: string
    tenantEmail: string
    startDate: Date
    notes?: string
  }
) => {
  try {
    const reservedUnit = await unitsManager.reserveUnit({ unitId, tenantData })

    // No usar la cache
    revalidatePath('/dashboard/units')
    revalidatePath('/dashboard/properties')

    return {
      success: true,
      data: reservedUnit,
      message: 'Unidad reservada exitosamente',
    }
  } catch (error) {
    console.error('Error en reserveUnitAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reservar la unidad',
    }
  }
}

export const getUnitsByPropertyAction = async (propertyId: string) => {
  try {
    const units = await unitsManager.getUnitsByProperty({ propertyId })
    return { success: true, data: units }
  } catch (error) {
    console.error('Error en getUnitsByPropertyAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener unidades de la propiedad',
    }
  }
}
