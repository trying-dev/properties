/**
 * Flow de chequeo end-to-end de todas las fases (F0–F6) sobre Casa Tibabuyes.
 * Lee los datos sembrados y valida que cada fase esté ejercitada y que los
 * efectos cruzados (descuentos en liquidación, cartera, alertas) se cumplan.
 *
 * Correr:  npx tsx scripts/check-phases.ts
 */
import { prisma } from '+/lib/prisma'
import { calculateOwnerPayoutsForPeriod } from '+/actions/payouts'
import { scanExpirations } from '+/lib/alerts/expirations'

const PROPERTY_ID = 'case-casa-tibabuyes'
const now = new Date()
const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

let pass = 0
let fail = 0
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`)
  ok ? pass++ : fail++
}

async function main() {
  console.log(`\n🔎 Chequeo de fases — Casa Tibabuyes — periodo ${period}\n`)

  // ── F0 Owner + participación ───────────────────────────────────────
  const owners = await prisma.propertyOwner.findMany({
    where: { propertyId: PROPERTY_ID, active: true },
    include: { owner: { include: { user: { select: { name: true } } } } },
  })
  const totalPart = owners.reduce((s, o) => s + o.participation, 0)
  check('F0  Owners con participación', owners.length >= 2 && totalPart === 100, `${owners.map((o) => `${o.owner.user.name} ${o.participation}%`).join(', ')}`)

  // ── F0.4 Confirmación de pago (REPORTED) ───────────────────────────
  const reported = await prisma.payment.count({
    where: { status: 'REPORTED', contract: { unit: { propertyId: PROPERTY_ID } } },
  })
  check('F0.4 Pago REPORTED pendiente de confirmar', reported >= 1, `${reported} reportado(s)`)

  // ── F1 Inspecciones ────────────────────────────────────────────────
  const inspections = await prisma.inspection.findMany({ where: { unit: { propertyId: PROPERTY_ID } } })
  const withFindings = inspections.filter((i) => i.criticalFindings > 0).length
  check('F1  Inspecciones (con hallazgos críticos)', inspections.length >= 2 && withFindings >= 1, `${inspections.length} inspecciones, ${withFindings} con hallazgos`)

  // ── F2 Mantenimiento ───────────────────────────────────────────────
  const maints = await prisma.maintenance.findMany({ where: { unit: { propertyId: PROPERTY_ID } } })
  const ownerCompleted = maints.filter((m) => m.status === 'COMPLETED' && m.costBearer === 'OWNER')
  const preventiveDue = maints.filter((m) => m.type === 'PREVENTIVE' && m.nextDueDate)
  check('F2  Mantenimiento (OWNER completado + preventivo con próxima fecha)', ownerCompleted.length >= 1 && preventiveDue.length >= 1, `${maints.length} registros`)

  // ── F3 Medidores ───────────────────────────────────────────────────
  const meters = await prisma.meter.findMany({ where: { propertyId: PROPERTY_ID }, include: { readings: true } })
  const withConsumption = meters.some((m) => m.readings.some((r) => r.consumption != null))
  check('F3  Medidores con lecturas y consumo calculado', meters.length >= 2 && withConsumption, `${meters.length} medidores, ${meters.reduce((s, m) => s + m.readings.length, 0)} lecturas`)

  // ── F4 Seguridad + Documentación ──────────────────────────────────
  const devices = await prisma.securityDevice.count({ where: { propertyId: PROPERTY_ID } })
  const docs = await prisma.propertyDocument.count({ where: { propertyId: PROPERTY_ID } })
  check('F4  Dispositivos de seguridad y documentos', devices >= 1 && docs >= 1, `${devices} dispositivos, ${docs} documentos`)

  // ── F5a Predial ────────────────────────────────────────────────────
  const taxPaid = await prisma.propertyTax.findFirst({ where: { propertyId: PROPERTY_ID, status: 'PAID' } })
  const taxPending = await prisma.propertyTax.count({ where: { propertyId: PROPERTY_ID, status: 'PENDING' } })
  check('F5a Predial pagado (para descuento) + pendiente', !!taxPaid && taxPending >= 1, `pagado ${taxPaid?.amount?.toLocaleString('es-CO')}`)

  // ── F5b Cartera ────────────────────────────────────────────────────
  const overdue = await prisma.payment.findMany({
    where: { status: { in: ['PENDING', 'REPORTED', 'OVERDUE', 'PARTIAL'] }, dueDate: { lt: now }, contract: { unit: { propertyId: PROPERTY_ID } } },
  })
  const totalOverdue = overdue.reduce((s, p) => s + p.amount, 0)
  check('F5b Cartera con pago(s) vencido(s)', overdue.length >= 1, `${overdue.length} vencido(s), $${totalOverdue.toLocaleString('es-CO')}`)

  // ── F5c Póliza ─────────────────────────────────────────────────────
  const policy = await prisma.insurancePolicy.findFirst({ where: { propertyId: PROPERTY_ID, status: 'ACTIVE' } })
  check('F5c Póliza vigente', !!policy, `${policy?.insurer} vence ${policy?.endDate.toLocaleDateString('es-CO')}`)

  // ── F0.5/0.6 Liquidación con descuentos ────────────────────────────
  const comp = await calculateOwnerPayoutsForPeriod(PROPERTY_ID, period)
  const payouts = await prisma.ownerPayout.findMany({ where: { period, owner: { properties: { some: { propertyId: PROPERTY_ID } } } } })
  const netMatchesComputation =
    payouts.length === comp.lines.length &&
    comp.lines.every((l) => {
      const p = payouts.find((x) => x.ownerId === l.ownerId)
      return p && Math.abs(p.netAmount - l.netAmount) < 0.01
    })
  check('F0.5 Liquidación descuenta mantenimiento OWNER', comp.propertyOwnerCosts >= 350_000, `costos OWNER $${comp.propertyOwnerCosts.toLocaleString('es-CO')}`)
  check('F5a Liquidación descuenta predial', comp.propertyTaxCosts >= 1_200_000, `predial $${comp.propertyTaxCosts.toLocaleString('es-CO')}`)
  check('F0.6 OwnerPayout persistido = cálculo', netMatchesComputation, `${payouts.length} payouts, neto $${comp.propertyNet.toLocaleString('es-CO')}`)

  // ── F6 Motor de alertas ────────────────────────────────────────────
  const items = await scanExpirations(now, 30)
  const propItems = items.filter((i) => i.propertyId === PROPERTY_ID)
  const sources = new Set(propItems.map((i) => i.source))
  check('F6  Alertas: múltiples fuentes por vencer', propItems.length >= 4, `${propItems.length} ítems: ${[...sources].join(', ')}`)

  console.log(`\n${fail === 0 ? '🎉' : '⚠️ '} Resultado: ${pass} OK, ${fail} fallos.\n`)
  if (propItems.length) {
    console.log('Próximos vencimientos (F6):')
    for (const i of propItems) console.log(`  · ${i.source.padEnd(12)} ${i.title} — ${i.detail} (${i.daysLeft < 0 ? `venció hace ${-i.daysLeft}d` : `en ${i.daysLeft}d`})`)
  }
  process.exitCode = fail === 0 ? 0 : 1
}

main().finally(() => prisma.$disconnect())
