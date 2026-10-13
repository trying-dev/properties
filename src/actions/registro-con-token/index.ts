'use server'

import { signInWithCredentials } from '+/lib/auth'
import { hashPassword, setCredentialPassword } from '+/lib/credentials'
import { prisma } from '+/lib/prisma'

const findTenantByToken = async (token: string) =>
  prisma.tenant.findFirst({
    where: {
      registrationToken: token,
      registrationTokenExpires: { gte: new Date() },
    },
    select: {
      id: true,
      userId: true,
      user: { select: { name: true, lastName: true, email: true } },
    },
  })

export const validateRegistrationToken = async (token: string) => {
  try {
    if (!token) {
      return {
        success: false,
        error: 'Token no proporcionado o inválido',
      }
    }

    const tenant = await findTenantByToken(token)
    if (!tenant) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      }
    }

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

export const completeUserRegistration = async ({
  token,
  password,
  agreeTerms,
}: {
  token: string
  password: string
  agreeTerms: boolean
}) => {
  try {
    // Validaciones básicas
    if (!token || typeof token !== 'string') {
      return {
        success: false,
        error: 'Token no proporcionado o inválido',
      }
    }

    if (!agreeTerms) {
      return {
        success: false,
        error: 'Debes aceptar los términos y condiciones',
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

    const tenant = await findTenantByToken(token)

    if (!tenant) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      }
    }

    const hashedPassword = await hashPassword(password)

    await prisma.$transaction(async (tx) => {
      await setCredentialPassword(tenant.userId, hashedPassword, tx)
      await tx.user.update({ where: { id: tenant.userId }, data: { termsAcceptedAt: new Date() } })
      await tx.tenant.update({
        where: { id: tenant.id },
        data: { registrationToken: null, registrationTokenExpires: null },
      })
    })

    const result = await signInWithCredentials(tenant.user.email, password)

    if (!result.success) {
      console.log(`❌ Login fallido para ${tenant.user.email}: ${result.code}`)
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

export type TenantValidationRegistrationToken = Awaited<ReturnType<typeof findTenantByToken>>
export type RegistrationCompletionResult = Awaited<ReturnType<typeof findTenantByToken>>
