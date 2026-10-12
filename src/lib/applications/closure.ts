import { Resend } from 'resend'
import { ContractStatus, NotificationType, ProcessStatus, UnitStatus } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { resolveEmailTargets } from '+/lib/email'
import { sendSystemNotificationAction } from '+/actions/notifications'

const resend = new Resend(process.env.RESEND_API_KEY)

export const OPEN_APPLICATION_STATUSES: ProcessStatus[] = [
  ProcessStatus.IN_PROGRESS,
  ProcessStatus.IN_EVALUATION,
  ProcessStatus.WAITING_FOR_FEEDBACK,
  ProcessStatus.APPROVED,
]

// Contratos que todavía no están firmados ni activos; pueden cancelarse junto con la solicitud.
export const PRE_SIGNATURE_CONTRACT_STATUSES: ContractStatus[] = [
  ContractStatus.INITIATED,
  ContractStatus.UNDER_REVIEW,
  ContractStatus.DOCUMENTATION,
  ContractStatus.APPROVED,
  ContractStatus.DRAFT,
  ContractStatus.PENDING,
]

export type ClosureReason = 'SIN_DEFINICION' | 'UNIDAD_NO_DISPONIBLE'

const closureCopy: Record<ClosureReason, { title: string; body: (place: string, days?: number) => string; note: string }> = {
  SIN_DEFINICION: {
    title: 'Tu solicitud fue cancelada por falta de definición',
    body: (place, days) =>
      `Tu solicitud para ${place} pasó ${days ?? 14} días sin definirse y quedó cancelada. Si la unidad sigue disponible, puedes volver a solicitarla.`,
    note: 'Sin definición en el plazo',
  },
  UNIDAD_NO_DISPONIBLE: {
    title: 'La unidad ya no está disponible',
    body: (place) =>
      `Lamentablemente ${place} ya no está disponible y tu solicitud fue cancelada. Te invitamos a conocer otras unidades que tenemos para ti.`,
    note: 'Unidad ya no disponible',
  },
}

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')

const sendClosureEmail = async ({
  tenantEmail,
  tenantName,
  title,
  message,
}: {
  tenantEmail?: string | null
  tenantName: string
  title: string
  message: string
}) => {
  const target = resolveEmailTargets(tenantEmail)
  if (!target.ok) return { sent: false, error: target.error }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const cta = appUrl
    ? `<p style="margin: 20px 0 0;"><a href="${appUrl}/" style="background: #2563eb; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 14px;">Ver otras unidades</a></p>`
    : ''

  await resend.emails.send({
    from: target.from,
    to: target.to,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; background: #f9fafb; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px;">
          <h1 style="font-size: 22px; margin: 0 0 12px;">${escapeHtml(tenantName || 'Hola')}</h1>
          <p style="font-size: 14px; line-height: 1.6; margin: 0;">${escapeHtml(message)}</p>
          ${cta}
        </div>
      </div>`,
  })
  return { sent: true, error: null }
}

// La unidad vuelve a VACANTE si estaba RESERVADA y ya no queda ninguna solicitud ni contrato abierto.
export const releaseUnitIfUnclaimed = async (unitId: string) => {
  const unit = await prisma.unit.findUnique({ where: { id: unitId }, select: { status: true } })
  if (!unit || unit.status !== UnitStatus.RESERVED) return false

  const [openApplications, openContracts] = await Promise.all([
    prisma.process.count({ where: { unitId, status: { in: OPEN_APPLICATION_STATUSES } } }),
    prisma.contract.count({ where: { unitId, status: { in: PRE_SIGNATURE_CONTRACT_STATUSES } } }),
  ])
  if (openApplications > 0 || openContracts > 0) return false

  await prisma.unit.update({ where: { id: unitId }, data: { status: UnitStatus.VACANT } })
  return true
}

// Cancela una solicitud abierta, cierra su contrato sin firmar y avisa al inquilino por app y correo.
export const closeApplication = async ({
  processId,
  reason,
  expiryDays,
}: {
  processId: string
  reason: ClosureReason
  expiryDays?: number
}) => {
  const process = await prisma.process.findUnique({
    where: { id: processId },
    select: {
      id: true,
      status: true,
      tenantId: true,
      unitId: true,
      contractId: true,
      contract: { select: { id: true, status: true } },
      tenant: { select: { user: { select: { email: true, name: true, lastName: true } } } },
      unit: { select: { unitNumber: true, property: { select: { name: true } } } },
    },
  })
  if (!process || !OPEN_APPLICATION_STATUSES.includes(process.status)) return { closed: false as const }

  const copy = closureCopy[reason]

  await prisma.process.update({
    where: { id: process.id },
    data: { status: ProcessStatus.CANCELLED, notes: copy.note },
  })

  if (process.contract && PRE_SIGNATURE_CONTRACT_STATUSES.includes(process.contract.status)) {
    await prisma.contract.update({
      where: { id: process.contract.id },
      data: { status: ContractStatus.CANCELLED, cancellationReason: copy.note },
    })
  }

  const place = process.unit
    ? `${process.unit.property.name} (Unidad ${process.unit.unitNumber})`
    : 'la unidad solicitada'
  const message = copy.body(place, expiryDays)

  if (process.tenantId) {
    await sendSystemNotificationAction({
      tenantId: process.tenantId,
      type: NotificationType.GENERAL,
      title: copy.title,
      body: message,
      link: '/',
    })
  }

  let emailSent = false
  try {
    const tenantName = [process.tenant?.user.name, process.tenant?.user.lastName].filter(Boolean).join(' ')
    const result = await sendClosureEmail({
      tenantEmail: process.tenant?.user.email,
      tenantName,
      title: copy.title,
      message,
    })
    emailSent = result.sent
  } catch (error) {
    console.error('Error enviando correo de cierre de solicitud:', error)
  }

  return { closed: true as const, unitId: process.unitId, emailSent }
}

// Cuando una unidad queda ocupada, las demás solicitudes abiertas sobre ella se cancelan y avisan.
export const closeCompetingApplications = async ({ unitId, winnerProcessId }: { unitId: string; winnerProcessId?: string | null }) => {
  const competing = await prisma.process.findMany({
    where: {
      unitId,
      status: { in: OPEN_APPLICATION_STATUSES },
      ...(winnerProcessId ? { id: { not: winnerProcessId } } : {}),
    },
    select: { id: true },
  })

  let closed = 0
  for (const item of competing) {
    const result = await closeApplication({ processId: item.id, reason: 'UNIDAD_NO_DISPONIBLE' })
    if (result.closed) closed += 1
  }
  return { closed }
}

// Cancela solicitudes sin actividad durante el plazo configurado en su propiedad.
export const expireStaleApplications = async (now = new Date()) => {
  const candidates = await prisma.process.findMany({
    where: { status: { in: OPEN_APPLICATION_STATUSES }, unitId: { not: null } },
    select: {
      id: true,
      status: true,
      unitId: true,
      updatedAt: true,
      contract: { select: { status: true } },
      unit: { select: { property: { select: { applicationExpiryDays: true } } } },
    },
  })

  const unitsToCheck = new Set<string>()
  let closed = 0

  for (const item of candidates) {
    const days = item.unit?.property.applicationExpiryDays
    if (!days || days <= 0) continue

    // Una solicitud aprobada con contrato en firma o activo sigue su propio curso.
    if (item.status === ProcessStatus.APPROVED && item.contract && !PRE_SIGNATURE_CONTRACT_STATUSES.includes(item.contract.status)) continue
    if (item.status === ProcessStatus.APPROVED && item.contract?.status === ContractStatus.PENDING) continue

    const limit = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    if (item.updatedAt > limit) continue

    const result = await closeApplication({ processId: item.id, reason: 'SIN_DEFINICION', expiryDays: days })
    if (result.closed) {
      closed += 1
      if (result.unitId) unitsToCheck.add(result.unitId)
    }
  }

  let released = 0
  for (const unitId of unitsToCheck) {
    if (await releaseUnitIfUnclaimed(unitId)) released += 1
  }

  return { scanned: candidates.length, closed, released }
}
