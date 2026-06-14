'use server'

import { Prisma, PropertyStatus, UnitStatus } from '@prisma/client'
import { prisma } from '+/lib/prisma'
import { deriveOccupancy } from '+/lib/occupancy'

// Occupancy derivada (no se persiste). Helpers puros en +/lib/occupancy.

type UnitCounts = {
  vacant: number
  occupied: number
  reserved: number
  maintenance: number
  unavailable: number
}

const emptyCounts = (): UnitCounts => ({ vacant: 0, occupied: 0, reserved: 0, maintenance: 0, unavailable: 0 })

const countByStatus = (statuses: UnitStatus[]): UnitCounts => {
  const counts = emptyCounts()
  for (const status of statuses) {
    if (status === UnitStatus.VACANT) counts.vacant += 1
    else if (status === UnitStatus.OCCUPIED) counts.occupied += 1
    else if (status === UnitStatus.RESERVED) counts.reserved += 1
    else if (status === UnitStatus.MAINTENANCE) counts.maintenance += 1
    else if (status === UnitStatus.UNAVAILABLE) counts.unavailable += 1
  }
  return counts
}

// Propiedades con su ocupación derivada. onlyAvailable = solo las que tienen alguna unidad VACANT.
export const getPropertiesWithOccupancy = async ({ onlyAvailable = false }: { onlyAvailable?: boolean } = {}) => {
  const where: Prisma.PropertyWhereInput = onlyAvailable
    ? { status: PropertyStatus.ACTIVE, units: { some: { status: UnitStatus.VACANT } } }
    : {}

  const properties = await prisma.property.findMany({
    where,
    select: {
      id: true,
      name: true,
      city: true,
      neighborhood: true,
      street: true,
      number: true,
      propertyType: true,
      status: true,
      units: { select: { status: true } },
    },
    orderBy: [{ city: 'asc' }, { neighborhood: 'asc' }, { name: 'asc' }],
  })

  return properties.map(({ units, ...property }) => {
    const totalUnits = units.length
    const counts = countByStatus(units.map((u) => u.status))
    return {
      ...property,
      totalUnits,
      counts,
      vacantUnits: counts.vacant,
      occupancyStatus: deriveOccupancy(totalUnits, counts.vacant),
    }
  })
}

export type PropertyWithOccupancy = Prisma.PromiseReturnType<typeof getPropertiesWithOccupancy>[0]

// Totales del portafolio para el overview del dashboard admin.
export const getOccupancySummary = async () => {
  const properties = await getPropertiesWithOccupancy()

  const summary = {
    totalProperties: properties.length,
    totalUnits: 0,
    vacantUnits: 0,
    occupiedUnits: 0,
    reservedUnits: 0,
    propertiesVacant: 0,
    propertiesPartial: 0,
    propertiesOccupied: 0,
  }

  for (const property of properties) {
    summary.totalUnits += property.totalUnits
    summary.vacantUnits += property.counts.vacant
    summary.occupiedUnits += property.counts.occupied
    summary.reservedUnits += property.counts.reserved
    if (property.occupancyStatus === 'VACANT') summary.propertiesVacant += 1
    else if (property.occupancyStatus === 'PARTIAL') summary.propertiesPartial += 1
    else if (property.occupancyStatus === 'OCCUPIED') summary.propertiesOccupied += 1
  }

  return summary
}

export type OccupancySummary = Prisma.PromiseReturnType<typeof getOccupancySummary>

// ========================================
// CAMBIO DE ESTADO CENTRALIZADO
// Único punto de transición de Unit.status.
// FUTURO: registrar acá UnitStatusHistory { unitId, status, changedAt, changedBy }
// para poder calcular cuánto tiempo estuvo vacante. Aditivo, no rompe nada.
// ========================================
export const setUnitStatus = async ({ unitId, status }: { unitId: string; status: UnitStatus }) =>
  prisma.unit.update({
    where: { id: unitId },
    data: { status },
    include: {
      property: { select: { name: true, city: true, neighborhood: true } },
    },
  })

export const getOccupancySummaryAction = async () => {
  try {
    const summary = await getOccupancySummary()
    return { success: true, data: summary }
  } catch (error) {
    console.error('Error en getOccupancySummaryAction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al obtener el resumen de ocupación' }
  }
}

export const getPropertiesWithOccupancyAction = async (opts?: { onlyAvailable?: boolean }) => {
  try {
    const data = await getPropertiesWithOccupancy(opts)
    return { success: true, data }
  } catch (error) {
    console.error('Error en getPropertiesWithOccupancyAction:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al obtener propiedades' }
  }
}
