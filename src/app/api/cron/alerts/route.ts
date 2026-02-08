import { NextRequest, NextResponse } from 'next/server'
import { generatePaymentAlerts } from '+/lib/payments/alerts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  console.log('[cron] alerts start')
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      console.warn('[cron] alerts unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const result = await generatePaymentAlerts()
  const durationMs = Date.now() - startedAt
  console.log(
    `[cron] alerts done overdueUpdated=${result.overdueUpdated} overdueNotified=${result.overdueNotified} remindersSent=${result.remindersSent} ms=${durationMs}`
  )
  return NextResponse.json(result)
}
