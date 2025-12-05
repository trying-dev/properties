'use server'

import { signIn } from '+/lib/auth'
import { resitroConToken } from './manager'

export const validateRegistrationToken = async (token: string) => {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Token no proporcionado o inválido',
      }
    }

    const tenant = await resitroConToken.validateRegistrationToken(token)

    return {
      success: true,
      tenant: tenant,
    }
  } catch (error) {
    console.error('Error en validateRegistrationToken:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error validando el token',
    }
  }
}

export const completeUserRegistration = async ({ token, password }: { token: string; password: string }) => {
  try {
    // Validaciones básicas
    if (!token || typeof token !== 'string') {
      return {
        success: false,
        error: 'Token no proporcionado o inválido',
      }
    }

    if (!password || typeof password !== 'string') {
      return {
        success: false,
        error: 'Contraseña no proporcionada',
      }
    }

    if (password.length < 8) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres',
      }
    }

    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return {
        success: false,
        error: 'La contraseña debe incluir mayúsculas, minúsculas y números',
      }
    }

    const tenant = await resitroConToken.completeUserRegistration({
      token,
      password,
    })

    // ✅ Usar la nueva contraseña proporcionada por el usuario, no la vieja de la DB
    const result = await signIn('credentials', {
      email: tenant.user.email,
      password: password, // 🔧 Cambio aquí: usar la contraseña nueva
      redirect: false,
    })

    // Verificar resultado
    if (result?.error) {
      console.log(`❌ Login fallido para ${tenant.user.email}: ${result.error}`)
      return {
        success: false,
        error: 'Error en la autenticación después del registro',
      }
    }

    // ✅ Login exitoso - sin redirección automática
    console.log(`✅ Login exitoso para: ${tenant.user.email}`)

    return {
      success: true,
      message: '¡Autenticación exitosa! Redirigiendo al dashboard...',
    }
  } catch (error) {
    console.error('Error en completeUserRegistration:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error completando el registro',
    }
  }
}
