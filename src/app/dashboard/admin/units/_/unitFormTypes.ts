import type { UnitStatus } from '@prisma/client'

export type UnitFormState = {
  unitNumber: string
  floor: string
  area: string
  bedrooms: string
  bathrooms: string
  furnished: boolean
  balcony: boolean
  parking: boolean
  storage: boolean
  petFriendly: boolean
  smokingAllowed: boolean
  internet: boolean
  cableTV: boolean
  waterIncluded: boolean
  gasIncluded: boolean
  status: UnitStatus
  baseRent: string
  deposit: string
  description: string
  images: string
  highlights: string
  lastInspectionDate: string
}
