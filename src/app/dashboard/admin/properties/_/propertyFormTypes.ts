import { PropertyType } from '@prisma/client'

export type PropertyFormState = {
  name: string
  description: string
  street: string
  number: string
  city: string
  neighborhood: string
  state: string
  postalCode: string
  country: string
  propertyType: PropertyType
  builtArea: string
  totalLandArea: string
  floors: string
  age: string
}
