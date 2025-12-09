'use server'

import { z } from 'zod'
import { prisma } from '+/lib/prisma'
import type { Prisma } from '@prisma/client'
import crypto from 'crypto'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'

const resend = new Resend(process.env.RESEND_API_KEY)

const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

const isTestMode = process.env.NODE_ENV !== 'production'
const testEmail = process.env.RESEND_EMAIL_TEST

export async function sendResetPasswordEmail(email: string) {
  try {
    // 1. Validar email
    const validated = resetPasswordSchema.parse({ email })

    // 2. Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    // Por seguridad, siempre retornamos éxito aunque el usuario no exista
    // Esto previene que alguien pueda saber qué emails están registrados
    if (!user) return { success: true }

    // 3. Generar token único y seguro
    const token = crypto.randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 3600000) // 1 hora

    // 4. Guardar token en la base de datos (sobre el propio usuario para evitar modelo extra)
    const resetTokenUpdate: Prisma.UserUpdateInput = {
      resetPasswordToken: token,
      resetPasswordExpiresAt: tokenExpiry,
      resetPasswordUsed: false,
    }

    await prisma.user.update({
      where: { id: user.id },
      data: resetTokenUpdate,
    })

    // 5. Construir URL de reset
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    // 6. Enviar email
    // En modo de prueba, siempre enviamos al email de testing
    const emailToSend = isTestMode ? testEmail : validated.email

    if (!emailToSend) {
      console.log('🔐 El email no esta definido')
      return { success: true }
    }

    console.log('🔐 Reset password info:')
    console.log('   Usuario solicitante:', validated.email)
    console.log('   Email enviado a:', emailToSend)
    console.log('   Link de reset:', resetUrl)
    console.log('   Modo:', isTestMode ? 'PRUEBA' : 'PRODUCCIÓN')

    await resend.emails.send({
      from: process.env.FROM_EMAIL as string,
      to: emailToSend,
      subject: 'Resetea tu Contraseña - PropertyHub',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background-color: #f3f4f6;
              color: #374151;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
              padding: 48px 32px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              color: #ffffff;
              font-size: 32px;
              font-weight: 700;
            }
            .header p {
              margin: 12px 0 0;
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
            }
            .content {
              padding: 40px 32px;
            }
            .content h2 {
              margin: 0 0 16px;
              color: #111827;
              font-size: 24px;
              font-weight: 600;
            }
            .content p {
              margin: 0 0 24px;
              color: #6b7280;
              font-size: 16px;
              line-height: 1.6;
            }
            .button {
              display: inline-block;
              padding: 16px 48px;
              background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
            }
            .button-container {
              text-align: center;
              margin: 40px 0;
            }
            .link-box {
              background-color: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 16px;
              margin: 24px 0;
              word-break: break-all;
            }
            .link-box p {
              margin: 0 0 8px;
              color: #6b7280;
              font-size: 14px;
            }
            .link-box a {
              color: #14b8a6;
              text-decoration: none;
              font-size: 14px;
            }
            .info-box {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 24px 0;
            }
            .info-box p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
            .footer {
              background-color: #f9fafb;
              padding: 32px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 0 0 8px;
              color: #6b7280;
              font-size: 14px;
            }
            ${
              isTestMode
                ? `
            .test-mode {
              background-color: #fef2f2;
              border: 2px solid #ef4444;
              padding: 16px;
              margin: 24px 0;
              border-radius: 8px;
              text-align: center;
            }
            .test-mode p {
              margin: 0;
              color: #991b1b;
              font-weight: 600;
            }
            `
                : ''
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Resetea tu Contraseña</h1>
              <p>Recibimos una solicitud para resetear tu contraseña</p>
            </div>

            <div class="content">
              ${
                isTestMode
                  ? `
              <div class="test-mode">
                <p>⚠️ MODO DE PRUEBA</p>
                <p style="font-size: 12px; margin-top: 8px;">Usuario: ${validated.email}</p>
              </div>
              `
                  : ''
              }

              <h2>Hola 👋</h2>
              <p>
                Recientemente solicitaste resetear tu contraseña para tu cuenta de PropertyHub.
                Haz clic en el botón de abajo para continuar con el proceso.
              </p>

              <div class="button-container">
                <a href="${resetUrl}" class="button">Resetear mi Contraseña</a>
              </div>

              <div class="link-box">
                <p>O copia y pega este enlace en tu navegador:</p>
                <a href="${resetUrl}">${resetUrl}</a>
              </div>

              <div class="info-box">
                <p>
                  <strong>⏰ Este enlace expirará en 1 hora.</strong><br>
                  Por razones de seguridad, este enlace de reseteo de contraseña solo es válido por 1 hora.
                </p>
              </div>

              <p style="margin-top: 32px;">
                Si no solicitaste resetear tu contraseña, puedes ignorar este email de forma segura.
                Tu contraseña permanecerá sin cambios.
              </p>

              <p style="color: #9ca3af; font-size: 14px;">
                Si tienes problemas haciendo clic en el botón, copia y pega la URL de arriba en tu navegador.
              </p>
            </div>

            <div class="footer">
              <p style="font-weight: 600; color: #14b8a6; font-size: 18px;">PropertyHub</p>
              <p>Property Management Made Simple</p>
              <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                Este es un email automático. Por favor no respondas a este mensaje.
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
                © 2024 PropertyHub. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending reset email:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Email inválido',
      }
    }

    return {
      success: false,
      message: 'Error al procesar la solicitud. Por favor intenta nuevamente.',
    }
  }
}

export async function validateResetToken(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token },
    })

    if (!user) {
      return { valid: false, message: 'Token inválido' }
    }

    if (!user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
      // Token expirado, eliminarlo
      const expiredUpdate: Prisma.UserUpdateInput = {
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        resetPasswordUsed: true,
      }
      await prisma.user.update({
        where: { id: user.id },
        data: expiredUpdate,
      })
      return { valid: false, message: 'Token expirado' }
    }

    if (user.resetPasswordUsed) {
      return { valid: false, message: 'Token ya utilizado' }
    }

    return {
      valid: true,
      userId: user.id,
      email: user.email,
    }
  } catch (error) {
    console.error('Error validating token:', error)
    return { valid: false, message: 'Error al validar token' }
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    // 1. Validar token
    const validation = await validateResetToken(token)

    if (!validation.valid) {
      return {
        success: false,
        message: validation.message,
      }
    }

    // 2. Hash de la nueva contraseña

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 3. Actualizar contraseña
    await prisma.user.update({
      where: { id: validation.userId },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
        resetPasswordUsed: true,
      },
    })

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    return {
      success: false,
      message: 'Error al resetear la contraseña',
    }
  }
}
