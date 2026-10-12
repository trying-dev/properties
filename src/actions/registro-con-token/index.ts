'use server'

import { headers } from 'next/headers'
import { ContractStatus } from '+/generated/prisma/client'
import { signInWithCredentials } from '+/lib/auth'
import { MANUAL_CODE, MANUAL_VERSION } from '+/lib/manual'
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

// El manual se exige en el registro si alguna propiedad con proceso abierto del inquilino lo pide.
// Sin procesos abiertos se aplica la regla por defecto (exigirlo).
const tenantRequiresManual = async (tenantId: string) => {
  const openStatuses: ContractStatus[] = [
    ContractStatus.INITIATED,
    ContractStatus.UNDER_REVIEW,
    ContractStatus.DOCUMENTATION,
    ContractStatus.APPROVED,
    ContractStatus.DRAFT,
    ContractStatus.PENDING,
  ]
  const contracts = await prisma.contract.findMany({
    where: { tenantId, status: { in: openStatuses } },
    select: { unit: { select: { property: { select: { requiresManualAcceptance: true } } } } },
  })
  if (contracts.length === 0) return true
  return contracts.some((contract) => contract.unit.property.requiresManualAcceptance)
}

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
      manual: {
        required: await tenantRequiresManual(tenant.id),
        code: MANUAL_CODE,
        version: MANUAL_VERSION,
      },
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
  acceptManual,
}: {
  token: string
  password: string
  agreeTerms: boolean
  acceptManual?: boolean
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

    // El servidor decide: si la propiedad exige el manual, el formulario no se completa sin aceptarlo.
    const manualRequired = await tenantRequiresManual(tenant.id)
    if (manualRequired && !acceptManual) {
      return {
        success: false,
        error: 'Debes leer y aceptar el Manual de Convivencia para completar el registro',
      }
    }

    const hashedPassword = await hashPassword(password)

    const requestHeaders = await headers()
    const ipAddress = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ?? requestHeaders.get('x-real-ip') ?? null
    const userAgent = requestHeaders.get('user-agent')

    await prisma.$transaction(async (tx) => {
      await setCredentialPassword(tenant.userId, hashedPassword, tx)
      if (acceptManual) {
        // Idempotente: si ya había aceptado esta versión se conserva la fecha original.
        await tx.manualAcceptance.upsert({
          where: { userId_manualCode_manualVersion: { userId: tenant.userId, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION } },
          create: { userId: tenant.userId, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION, ipAddress, userAgent },
          update: {},
        })
      }
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
