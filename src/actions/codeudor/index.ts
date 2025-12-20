'use server'

import { randomBytes } from 'crypto'
import { Resend } from 'resend'

import { Prisma } from '@prisma/client'
import { prisma } from '+/lib/prisma'

const isTestMode = process.env.NODE_ENV !== 'production'
const testEmail = process.env.RESEND_EMAIL_TEST

type CoDebtorInput = {
  name: string
  lastName: string
  birthDate: string
  documentNumber: string
  email: string
  phone: string
}

type CoDebtorWithToken = CoDebtorInput & {
  token: string
  tokenExpiresAt: string
  confirmedAt: string | null
}

const buildConfirmationEmail = ({ name, confirmUrl }: { name: string; confirmUrl: string }) => `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Confirmacion de Codeudor</title>
    </head>
    <body style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <tr>
          <td style="padding: 32px;">
            <h1 style="margin: 0 0 16px; font-size: 22px;">Hola ${name},</h1>
            <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6;">
              Se ha ingresado tu informacion como codeudor en una solicitud de arriendo. Para confirmar que
              estas de acuerdo, por favor valida tus datos y aprueba dando click en el siguiente enlace.
            </p>
            <p style="margin: 20px 0;">
              <a href="${confirmUrl}" style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px; font-size: 14px;">
                Confirmar como codeudor
              </a>
            </p>
            <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">
              Si no reconoces esta solicitud, puedes ignorar este mensaje.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>
`

export const sendCoDebtorConfirmationEmailsAction = async ({
  processId,
  selectedSecurity,
  coDebtors,
}: {
  processId: string
  selectedSecurity: string
  coDebtors: CoDebtorInput[]
}) => {
  try {
    const processRecord = await prisma.process.findUnique({
      where: { id: processId },
      select: { payload: true },
    })

    if (!processRecord) {
      return { success: false, error: 'Proceso no encontrado' }
    }

    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const coDebtorsWithTokens: CoDebtorWithToken[] = coDebtors.map((coDebtor) => ({
      ...coDebtor,
      token: randomBytes(24).toString('hex'),
      tokenExpiresAt,
      confirmedAt: null,
    }))

    const existingPayload = (processRecord.payload ?? {}) as Record<string, unknown>
    const existingSecurity = (existingPayload.security ?? {}) as Record<string, unknown>

    const updatedPayload = {
      ...existingPayload,
      security: {
        ...existingSecurity,
        selectedSecurity,
        coDebtors: coDebtorsWithTokens,
      },
    }

    await prisma.process.update({
      where: { id: processId },
      data: { payload: updatedPayload },
    })

    const resend = new Resend(process.env.RESEND_API_KEY)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const fromEmail = process.env.FROM_EMAIL

    if (!appUrl || !fromEmail) {
      return { success: false, error: 'Faltan variables de entorno para enviar correos' }
    }

    if (isTestMode && !testEmail) {
      return { success: false, error: 'Falta RESEND_EMAIL_TEST para el modo de pruebas' }
    }

    const results = await Promise.allSettled(
      coDebtorsWithTokens.map((coDebtor) => {
        const emailToSend = isTestMode ? testEmail : coDebtor.email
        if (!emailToSend) {
          return Promise.reject(new Error('Email destino no definido'))
        }
        const confirmUrl = `${appUrl}/codeudor/confirmar?processId=${encodeURIComponent(
          processId
        )}&token=${encodeURIComponent(coDebtor.token)}`

        return resend.emails.send({
          from: fromEmail,
          to: [emailToSend],
          subject: 'Confirma tu participacion como codeudor',
          html: buildConfirmationEmail({
            name: `${coDebtor.name} ${coDebtor.lastName}`,
            confirmUrl,
          }),
        })
      })
    )

    const failed = results.filter((result) => result.status === 'rejected')
    if (failed.length > 0) {
      return {
        success: false,
        error: 'Uno o mas correos no pudieron enviarse.',
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error enviando correos a codeudores:', error)
    return { success: false, error: 'No se pudieron enviar los correos de confirmacion' }
  }
}

export const confirmCoDebtorAction = async ({ processId, token }: { processId: string; token: string }) => {
  try {
    const processRecord = await prisma.process.findUnique({
      where: { id: processId },
      select: { payload: true },
    })

    if (!processRecord) {
      return { success: false, error: 'Proceso no encontrado' }
    }

    const payload = (processRecord.payload ?? {}) as Record<string, unknown>
    const security = (payload.security ?? {}) as Record<string, unknown>
    const coDebtors = Array.isArray(security.coDebtors) ? security.coDebtors : []

    const now = new Date()
    let matched = false
    let expired = false

    const updatedCoDebtors = coDebtors.map((item) => {
      const coDebtor = item as Record<string, unknown>
      if (coDebtor.token !== token) return coDebtor

      matched = true
      const expiresAt = coDebtor.tokenExpiresAt ? new Date(String(coDebtor.tokenExpiresAt)) : null
      if (!expiresAt || expiresAt < now) {
        expired = true
        return coDebtor
      }

      return {
        ...coDebtor,
        confirmedAt: now.toISOString(),
      }
    })

    if (!matched) {
      return { success: false, error: 'Token no valido' }
    }

    if (expired) {
      return { success: false, error: 'Token expirado' }
    }

    const updatedPayload = {
      ...payload,
      security: {
        ...security,
        coDebtors: updatedCoDebtors,
      },
    }

    await prisma.process.update({
      where: { id: processId },
      data: { payload: updatedPayload as Prisma.InputJsonValue },
    })

    return { success: true }
  } catch (error) {
    console.error('Error confirmando codeudor:', error)
    return { success: false, error: 'No se pudo confirmar al codeudor' }
  }
}
