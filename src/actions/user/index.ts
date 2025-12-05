'use server'

import { auth } from '+/lib/auth'
import { userManager } from './manager'

export const getUserTenant = async () => {
  const session = await auth()

  if (!session?.user.id) return null

  try {
    return await userManager.getUserTenant(session.user.id)
  } catch (error) {
    console.error('Error fetching tenant by ID:', error)
    throw error
  }
}
