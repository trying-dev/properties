/**
 * Chequeo del cierre de solicitudes: vencimiento por falta de definición y
 * cancelación de solicitudes en competencia cuando la unidad deja de estar disponible.
 * Crea datos temporales y los elimina al terminar. No envía correos (sin FROM_EMAIL).
 *
 * Correr:  FROM_EMAIL= npx tsx scripts/check-application-closure.ts
 */
import { prisma } from '+/lib/prisma'
import { closeCompetingApplications, expireStaleApplications } from '+/lib/applications/closure'

let pass = 0
let fail = 0
const check = (label: string, ok: boolean, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`)
  ok ? pass++ : fail++
}

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000)

async function main() {
  const unit = await prisma.unit.findFirst({ where: { status: 'VACANT' }, select: { id: true, status: true, property: { select: { id: true, applicationExpiryDays: true } } } })
  const tenants = await prisma.tenant.findMany({ take: 3, select: { id: true } })
  if (!unit || tenants.length < 3) throw new Error('Faltan unidad vacante o inquilinos en la base')

  const created: string[] = []
  const makeProcess = async (tenantId: string, status: 'IN_EVALUATION' | 'APPROVED', updatedAt: Date) => {
    const process = await prisma.process.create({ data: { tenantId, unitId: unit.id, status, updatedAt }, select: { id: true } })
    created.push(process.id)
    return process.id
  }

  try {
    const days = unit.property.applicationExpiryDays
    console.log(`\n🔎 Cierre de solicitudes — plazo ${days} días\n`)

    // 1. Vencimiento
    await prisma.unit.update({ where: { id: unit.id }, data: { status: 'RESERVED' } })
    const stale = await makeProcess(tenants[0].id, 'IN_EVALUATION', daysAgo(days + 1))
    const fresh = await makeProcess(tenants[1].id, 'IN_EVALUATION', daysAgo(1))
    let result = await expireStaleApplications()
    const staleRow = await prisma.process.findUnique({ where: { id: stale }, select: { status: true, notes: true } })
    const freshRow = await prisma.process.findUnique({ where: { id: fresh }, select: { status: true } })
    check('solicitud vencida pasa a CANCELLED', staleRow?.status === 'CANCELLED', staleRow?.notes ?? '')
    check('solicitud reciente sigue abierta', freshRow?.status === 'IN_EVALUATION')
    check('unidad sigue RESERVADA mientras haya solicitud abierta', (await prisma.unit.findUnique({ where: { id: unit.id } }))?.status === 'RESERVED')

    // 2. Última solicitud vence, la unidad se libera
    await prisma.process.update({ where: { id: fresh }, data: { updatedAt: daysAgo(days + 2) } })
    result = await expireStaleApplications()
    check('segunda solicitud vence', (await prisma.process.findUnique({ where: { id: fresh } }))?.status === 'CANCELLED')
    check('unidad vuelve a VACANTE', (await prisma.unit.findUnique({ where: { id: unit.id } }))?.status === 'VACANT', `released=${result.released}`)

    // 3. Competencia
    const winner = await makeProcess(tenants[0].id, 'APPROVED', new Date())
    const loserA = await makeProcess(tenants[1].id, 'IN_EVALUATION', new Date())
    const loserB = await makeProcess(tenants[2].id, 'IN_EVALUATION', new Date())
    const competing = await closeCompetingApplications({ unitId: unit.id, winnerProcessId: winner })
    check('se cancelan las solicitudes en competencia', competing.closed === 2, `closed=${competing.closed}`)
    check('la ganadora queda intacta', (await prisma.process.findUnique({ where: { id: winner } }))?.status === 'APPROVED')
    check('las perdedoras quedan CANCELLED', (await prisma.process.count({ where: { id: { in: [loserA, loserB] }, status: 'CANCELLED' } })) === 2)

    // 4. Aviso en app al inquilino
    const notice = await prisma.notification.count({ where: { tenantId: tenants[1].id, title: 'La unidad ya no está disponible' } })
    check('inquilino perdedor recibe notificación', notice >= 1)
  } finally {
    await prisma.notification.deleteMany({ where: { title: { in: ['La unidad ya no está disponible', 'Tu solicitud fue cancelada por falta de definición'] }, tenantId: { in: tenants.map((t) => t.id) } } })
    await prisma.process.deleteMany({ where: { id: { in: created } } })
    await prisma.unit.update({ where: { id: unit.id }, data: { status: unit.status } })
  }

  console.log(`\n${pass} OK · ${fail} fallos\n`)
  process.exit(fail ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
