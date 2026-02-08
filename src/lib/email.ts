export type EmailTargetResult =
  | { ok: true; from: string; to: string; isTestMode: boolean }
  | { ok: false; error: string; isTestMode: boolean }

const isTestingEmailEnabled = () => {
  const flag = process.env.USING_TESTING_EMAIL
  if (!flag) return false
  return flag.toLowerCase() === 'true'
}

export const resolveEmailTargets = (targetEmail?: string | null): EmailTargetResult => {
  const isTestMode = isTestingEmailEnabled()
  const testEmail = process.env.RESEND_EMAIL_TEST
  const fromEmail = process.env.FROM_EMAIL

  if (!fromEmail) {
    return { ok: false, error: 'Falta FROM_EMAIL para enviar correos', isTestMode }
  }

  if (isTestMode) {
    if (!testEmail) {
      return { ok: false, error: 'Falta RESEND_EMAIL_TEST para el modo de pruebas', isTestMode }
    }
    return { ok: true, from: fromEmail, to: testEmail, isTestMode }
  }

  if (!targetEmail) {
    return { ok: false, error: 'Email destino no definido', isTestMode }
  }

  return { ok: true, from: fromEmail, to: targetEmail, isTestMode }
}
