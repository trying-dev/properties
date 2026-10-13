import { Resend } from 'resend'
import { resolveEmailTargets } from '+/lib/email'

const resend = new Resend(process.env.RESEND_API_KEY)

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

// Correo formal del procedimiento disciplinario. Si falla, la actuación ya quedó registrada en la app.
export const sendDisciplineNotice = async ({
  tenantEmail,
  tenantName,
  subject,
  message,
  link,
}: {
  tenantEmail?: string | null
  tenantName: string
  subject: string
  message: string
  link: string
}) => {
  try {
    const target = resolveEmailTargets(tenantEmail)
    if (!target.ok) return { sent: false, error: target.error }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const cta = appUrl
      ? `<p style="margin: 20px 0 0;"><a href="${appUrl}${link}" style="background: #111827; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 14px;">Ver el procedimiento</a></p>`
      : ''

    await resend.emails.send({
      from: target.from,
      to: target.to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px;">
            <h1 style="font-size: 20px; margin: 0 0 12px;">${escapeHtml(tenantName || 'Hola')}</h1>
            <p style="font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-line;">${escapeHtml(message)}</p>
            ${cta}
          </div>
        </div>`,
    })
    return { sent: true, error: null }
  } catch (error) {
    console.error('Error enviando correo disciplinario:', error)
    return { sent: false, error: 'No se pudo enviar el correo' }
  }
}
