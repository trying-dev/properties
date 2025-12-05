'use server'

import { processConfirmationManager } from './manager'
import { emailService } from './emailResend'
import { randomBytes } from 'crypto'

export const getProcessDetailsAction = async (unitId: string, tenantId: string) => {
  try {
    const details = await processConfirmationManager.getProcessDetails({ unitId, tenantId })
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
    const contract = await processConfirmationManager.initializeContract({
      unitId,
      tenantId,
      adminId,
      notes,
    })

    const details = await processConfirmationManager.getProcessDetails({
      unitId,
      tenantId,
    })

    const { name, lastName, email, password } = details.tenant.user

    const isNewUser = password === null

    let emailResult

    if (isNewUser) {
      console.log('📧 Enviando email de registro para usuario nuevo:', email)

      const registrationToken = randomBytes(32).toString('hex')

      await processConfirmationManager.updateUserRegistrationToken(tenantId, registrationToken)

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
