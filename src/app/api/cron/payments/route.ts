import { NextRequest, NextResponse } from 'next/server'
import { generateMonthlyPaymentsForActiveContracts } from '+/lib/payments/monthly'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startedAt = Date.now()
  console.log('[cron] payments start')
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      console.warn('[cron] payments unauthorized')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  const result = await generateMonthlyPaymentsForActiveContracts()
  const durationMs = Date.now() - startedAt
  console.log(`[cron] payments done created=${result.created} skipped=${result.skipped} ms=${durationMs}`)
  return NextResponse.json(result)
}
