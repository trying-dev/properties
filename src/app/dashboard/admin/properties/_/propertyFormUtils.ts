import { Property, PropertyType } from '@prisma/client'
import type { PropertyFormState } from './propertyFormTypes'

export const toPropertyFormState = (property: Property): PropertyFormState => ({
  name: property.name ?? '',
  description: property.description ?? '',
  street: property.street ?? '',
  number: property.number ?? '',
  city: property.city ?? '',
  neighborhood: property.neighborhood ?? '',
  state: property.state ?? '',
  postalCode: property.postalCode ?? '',
  country: property.country ?? 'Colombia',
  propertyType: property.propertyType ?? PropertyType.APARTMENT,
  builtArea: property.builtArea != null ? String(property.builtArea) : '',
  totalLandArea: property.totalLandArea != null ? String(property.totalLandArea) : '',
  floors: property.floors != null ? String(property.floors) : '1',
  age: property.age != null ? String(property.age) : '',
})
