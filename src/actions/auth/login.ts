'use server'

import { signInWithCredentials } from '+/lib/auth'
import { prisma } from '+/lib/prisma'

export const authenticate = async (
  prevState:
    | {
        success: boolean
        errors?: Record<string, string[]>
        redirectTo?: string
      }
    | undefined,
  formData: FormData
) => {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    console.log(`🔐 Iniciando autenticación para: ${email}`)

    // Validaciones detalladas
    const errors: Record<string, string[]> = {}

    if (!email) {
      errors.email = ['El email es requerido']
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ['El formato del email no es válido']
    }

    if (!password) {
      errors.password = ['La contraseña es requerida']
    } else if (password.length < 6) {
      errors.password = ['La contraseña debe tener al menos 6 caracteres']
    }

    if (Object.keys(errors).length > 0) {
      console.log(`❌ Errores de validación para ${email}:`, errors)
      return { success: false, errors }
    }

    const result = await signInWithCredentials(email, password)

    if (!result.success) {
      console.log(`❌ Login fallido para ${email}: ${result.code}`)
      const message =
        result.code === 'ACCOUNT_DISABLED'
          ? 'Tu cuenta está deshabilitada. Contacta al administrador.'
          : result.code === 'INVALID_CREDENTIALS'
            ? 'Credenciales incorrectas. Verifica tu email y contraseña.'
            : 'Error de autenticación. Intenta de nuevo.'
      return { success: false, errors: { form: [message] } }
    }

    await prisma.user.update({ where: { id: result.userId }, data: { lastLoginAt: new Date() } })

    console.log(`✅ Login exitoso para: ${email}`)

    // Destino según el rol, para navegar sin depender de una segunda consulta en el cliente.
    const account = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { admin: { select: { id: true } }, owner: { select: { id: true } } },
    })
    const redirectTo = account?.admin ? '/dashboard/admin' : account?.owner ? '/dashboard/owner' : '/dashboard/tenant'

    return { success: true, redirectTo }
  } catch (error) {
    console.error('❌ Error en authenticate:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      email: formData.get('email'),
      timestamp: new Date().toISOString(),
    })

    return { success: false, errors: { form: ['Error interno del servidor'] } }
  }
}
