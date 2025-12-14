'use server'

import { hash } from 'bcryptjs'
import { Resend } from 'resend'

import { prisma } from '+/lib/prisma'
import { randomInt } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)
const isTestMode = process.env.NODE_ENV !== 'production'
const testEmail = process.env.RESEND_EMAIL_TEST

export type RegisterActionState = {
  success: boolean
  needsVerification?: boolean
  errors?: Record<string, string[]>
}

export const registerUser = async (_prevState: RegisterActionState | undefined, formData: FormData) => {
  const firstName = (formData.get('firstName') as string | null)?.trim() || ''
  const lastName = (formData.get('lastName') as string | null)?.trim() || ''
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() || ''
  const password = (formData.get('password') as string | null) || ''
  const agreeTerms = formData.get('agreeTerms') === 'on'

  const errors: Record<string, string[]> = {}

  if (!firstName) errors.firstName = ['El nombre es requerido']
  if (!lastName) errors.lastName = ['Los apellidos son requeridos']
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
  if (!agreeTerms) errors.agreeTerms = ['Debes aceptar los términos y condiciones']

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, emailVerified: true },
    })

    if (existingUser) {
      return {
        success: false,
        errors: { email: ['Ya existe una cuenta con este email.'] },
      }
    }

    const hashedPassword = await hash(password, 10)
    const verificationCode = randomInt(100000, 1000000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: firstName,
        lastName,
        verificationCode,
        verificationCodeExpiresAt: verificationExpires,
        tenant: { create: {} },
      },
    })

    const emailToSend = isTestMode ? testEmail : email
    if (emailToSend) {
      await resend.emails.send({
        from: process.env.FROM_EMAIL as string,
        to: emailToSend,
        subject: 'Código de verificación',
        html: `<p>Tu código de verificación es: <strong>${verificationCode}</strong></p><p>Caduca en 15 minutos.</p>`,
      })
    } else {
      console.warn('⚠️ No se envió código porque no hay email destino (FROM/RESEND_EMAIL_TEST?)')
    }

    return { success: false, needsVerification: true }
  } catch (error) {
    console.error('❌ Error durante el registro:', error)
    return { success: false, errors: { form: ['No pudimos completar el registro. Inténtalo nuevamente.'] } }
  }
}
