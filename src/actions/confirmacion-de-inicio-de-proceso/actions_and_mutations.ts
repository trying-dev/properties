'use server'

import { emailService } from './emailResend'
import { randomBytes } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '+/lib/prisma'

export const getProcessDetails = async ({ unitId, tenantId }: { unitId: string; tenantId: string }) => {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { property: { include: { admin: { include: { user: true } } } } },
  })

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { user: true },
  })

  if (!unit || !tenant) {
    throw new Error('Unidad o inquilino no encontrado')
  }

  return { unit, tenant }
}

export const initializeContract = async ({
  unitId,
  tenantId,
  adminId,
  notes,
}: {
  unitId: string
  tenantId: string
  adminId: string
  notes?: string
}) => {
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: {
      id: true,
      status: true,
      baseRent: true,
      deposit: true,
      unitNumber: true,
      property: { select: { name: true } },
    },
  })

  if (!unit) throw new Error('La unidad especificada no existe')
  if (!unit.baseRent) throw new Error('La unidad no tiene una renta base definida')

  const [tenant, userAdmin] = await Promise.all([
    prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { user: { select: { name: true, lastName: true, email: true, password: true } } },
    }),
    prisma.user.findUnique({
      where: { id: adminId },
      select: { name: true, lastName: true, admin: { select: { id: true } } },
    }),
  ])

  if (!tenant) throw new Error('El inquilino especificado no existe')
  if (!userAdmin) throw new Error('El usuario administrador especificado no existe')
  if (!userAdmin.admin?.id) throw new Error('El usuario administrador especificado no tiene id')

  const contract = await prisma.contract.create({
    data: {
      unitId,
      tenantId,
      adminId: userAdmin.admin?.id,
      status: 'INITIATED',
      notes,
      rent: unit.baseRent,
      deposit: unit.deposit || unit.baseRent,
      startDate: new Date(),
      endDate: new Date(),
      initiatedAt: new Date(),
    },
    include: {
      unit: { include: { property: { select: { name: true } } } },
      tenant: {
        include: { user: { select: { name: true, lastName: true, email: true, password: true } } },
      },
    },
  })

  return {
    id: contract.id,
    unitId: contract.unitId,
    tenantId: contract.tenantId,
    adminId: contract.adminId,
    status: contract.status,
    notes: contract.notes,
    rent: contract.rent,
    deposit: contract.deposit,
    createdAt: contract.createdAt,
    unit: contract.unit,
    tenant: contract.tenant,
    admin: userAdmin,
  }
}

export const updateUserRegistrationToken = async (tenantId: string, registrationToken: string) =>
  prisma.tenant.update({
    where: { id: tenantId },
    data: {
      registrationToken,
      registrationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

export type ProcessDetails = Prisma.PromiseReturnType<typeof getProcessDetails>

export const getProcessDetailsAction = async (unitId: string, tenantId: string) => {
  try {
    const details = await getProcessDetails({ unitId, tenantId })
    return { success: true, data: details }
  } catch (error) {
    console.error('Error en getProcessDetailsAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener detalles del proceso',
    }
  }
}

export const initializeContractAction = async ({
  unitId,
  tenantId,
  adminId,
  notes,
}: {
  unitId: string
  tenantId: string
  adminId: string
  notes?: string
}) => {
  try {
    const contract = await initializeContract({
      unitId,
      tenantId,
      adminId,
      notes,
    })

    const details = await getProcessDetails({
      unitId,
      tenantId,
    })

    const { name, lastName, email, password } = details.tenant.user

    const isNewUser = password === null

    let emailResult

    if (isNewUser) {
      console.log('📧 Enviando email de registro para usuario nuevo:', email)

      const registrationToken = randomBytes(32).toString('hex')

      await updateUserRegistrationToken(tenantId, registrationToken)

      emailResult = await emailService.sendNewUserRegistrationEmail({
        // tenantEmail: email,
        tenantEmail: 'revi-pruebas@outlook.com',
        tenantName: `${name} ${lastName}`,
        registrationToken,
      })
    } else {
      console.log('📧 Enviando email de continuación para usuario existente:', email)

      emailResult = await emailService.sendExistingUserContinueEmail({
        // tenantEmail: email,
        tenantEmail: 'revi-pruebas@outlook.com',
        tenantName: `${name} ${lastName}`,
      })
    }

    return {
      success: true,
      data: {
        contract,
        emailSent: emailResult.success,
        emailId: emailResult.emailId,
        userType: isNewUser ? 'new' : 'existing',
        emailType: isNewUser ? 'registration' : 'continue',
      },
      message: isNewUser
        ? 'Contrato inicializado y email de registro enviado al usuario nuevo'
        : 'Contrato inicializado y email de continuación enviado al usuario existente',
    }
  } catch (error) {
    console.error('Error en initializeContractAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al inicializar el contrato',
    }
  }
}
