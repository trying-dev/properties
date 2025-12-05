'use server'

import { revalidatePath } from 'next/cache'
import { adminManager, CreateAdminInput } from './manager'

export const createAdmin = async (data: CreateAdminInput) => {
  try {
    if (!data.email || !data.name || !data.lastName || !data.documentNumber || !data.temporaryPassword)
      return {
        success: false,
        error: 'Faltan campos requeridos',
      }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email))
      return {
        success: false,
        error: 'Formato de email inválido',
      }

    if (data.temporaryPassword.length < 8)
      return {
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres',
      }

    const admin = await adminManager.createAdmin(data)

    revalidatePath('/admin/users')
    revalidatePath('/admin/admins')

    return {
      success: true,
      data: admin,
      message: 'Administrador creado exitosamente',
    }
  } catch (error) {
    console.error('Error al crear administrador:', error)

    if (error instanceof Error)
      return {
        success: false,
        error: error.message,
      }

    return {
      success: false,
      error: 'Error interno del servidor. Intente nuevamente.',
    }
  }
}
