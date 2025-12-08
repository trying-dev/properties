'use server'

import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signIn } from '+/lib/auth'
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
      user: { select: { name: true, lastName: true, email: true, password: true } },
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

    const tenant = await findTenantByToken(token)

    if (!tenant) {
      return {
        success: false,
        error: 'Token inválido o expirado',
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        registrationToken: null,
        registrationTokenExpires: null,
        user: { update: { password: hashedPassword } },
      },
    })

    const result = await signIn('credentials', {
      email: tenant.user.email,
      password: password,
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

export type TenantValidationRegistrationToken = Prisma.PromiseReturnType<typeof findTenantByToken>
export type RegistrationCompletionResult = Prisma.PromiseReturnType<typeof findTenantByToken>
