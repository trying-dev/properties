'use server'

import { auth, signOut } from '+/lib/auth'

export const getSession = async () => {
  try {
    const session = await auth()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

export const getUserRole = async () => {
  try {
    const session = await auth()
    return session?.user?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

export const logout = async () => {
  // Solo limpiar sesión; el redireccionamiento se maneja en el cliente
  await signOut({ redirectTo: '/', redirect: false })
}
