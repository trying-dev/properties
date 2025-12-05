'use server'

import { propertyManager } from './manager'

export const getProperties = async () => {
  try {
    return await propertyManager.getProperties()
  } catch (error) {
    console.error('Error fetching properties:', error)
    throw error
  }
}

export const getProperty = async ({ id }: { id: string }) => {
  try {
    return propertyManager.getProperty({ id })
  } catch (error) {
    console.error('Error fetching property by ID:', error)
    throw error
  }
}
