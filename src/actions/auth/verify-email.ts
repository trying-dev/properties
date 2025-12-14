'use server'

import { z } from 'zod'
import { Resend } from 'resend'

import { prisma } from '+/lib/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)
const isTestMode = process.env.NODE_ENV !== 'production'
const testEmail = process.env.RESEND_EMAIL_TEST

const emailSchema = z.object({ email: z.string().email() })
const codeSchema = z.object({ code: z.string().length(6).regex(/^\d+$/) })

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function resendVerificationCode(email: string) {
  const parsed = emailSchema.safeParse({ email })
  if (!parsed.success) return { success: false, errors: { email: ['Email inválido'] } }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (!user) return { success: false, errors: { form: ['Usuario no encontrado'] } }

  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationCode: code, verificationCodeExpiresAt: expiresAt },
  })

  const emailToSend = isTestMode ? testEmail : parsed.data.email
  if (!emailToSend) return { success: true }

  await resend.emails.send({
    from: process.env.FROM_EMAIL as string,
    to: emailToSend,
    subject: 'Tu código de verificación',
    html: `<p>Tu código de verificación es: <strong>${code}</strong></p><p>Caduca en 15 minutos.</p>`,
  })

  return { success: true }
}

export async function verifyEmailCode(email: string, code: string) {
  const emailParsed = emailSchema.safeParse({ email })
  const codeParsed = codeSchema.safeParse({ code })
  if (!emailParsed.success || !codeParsed.success) {
    return { success: false, errors: { form: ['Código o email inválidos'] } }
  }

  const user = await prisma.user.findUnique({ where: { email: emailParsed.data.email } })
  if (!user || !user.verificationCode || !user.verificationCodeExpiresAt) {
    return { success: false, errors: { form: ['No hay un código activo para este usuario.'] } }
  }

  if (user.verificationCodeExpiresAt < new Date()) {
    return { success: false, errors: { form: ['El código ha expirado. Solicita uno nuevo.'] } }
  }

  if (user.verificationCode !== codeParsed.data.code) {
    return { success: false, errors: { form: ['Código incorrecto.'] } }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      verificationCode: null,
      verificationCodeExpiresAt: null,
    },
  })

  return { success: true }
}
