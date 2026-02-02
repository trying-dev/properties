import type { Unit } from '@prisma/client'
import type { UnitFormState } from './unitFormTypes'

const formatDateInput = (value?: Date | null) => {
  if (!value) return ''
  const date = new Date(value)
  return date.toISOString().slice(0, 10)
}

export const toUnitFormState = (unit: Unit): UnitFormState => ({
  unitNumber: unit.unitNumber ?? '',
  floor: unit.floor != null ? String(unit.floor) : '',
  area: unit.area != null ? String(unit.area) : '',
  bedrooms: unit.bedrooms != null ? String(unit.bedrooms) : '0',
  bathrooms: unit.bathrooms != null ? String(unit.bathrooms) : '0',
  furnished: unit.furnished ?? false,
  balcony: unit.balcony ?? false,
  parking: unit.parking ?? false,
  storage: unit.storage ?? false,
  petFriendly: unit.petFriendly ?? false,
  smokingAllowed: unit.smokingAllowed ?? false,
  internet: unit.internet ?? false,
  cableTV: unit.cableTV ?? false,
  waterIncluded: unit.waterIncluded ?? false,
  gasIncluded: unit.gasIncluded ?? false,
  status: unit.status,
  baseRent: unit.baseRent != null ? String(unit.baseRent) : '',
  deposit: unit.deposit != null ? String(unit.deposit) : '',
  description: unit.description ?? '',
  images: unit.images ?? '',
  highlights: unit.highlights ? JSON.stringify(unit.highlights, null, 2) : '',
  lastInspectionDate: formatDateInput(unit.lastInspectionDate),
})
