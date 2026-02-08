'use server'

import { z } from 'zod'
import { Resend } from 'resend'

import { prisma } from '+/lib/prisma'
import { resolveEmailTargets } from '+/lib/email'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  const emailTarget = resolveEmailTargets(parsed.data.email)
  if (!emailTarget.ok) return { success: true }

  await resend.emails.send({
    from: emailTarget.from,
    to: emailTarget.to,
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
