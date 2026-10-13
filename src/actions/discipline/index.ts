'use server'

import { revalidatePath } from 'next/cache'
import {
  AppealOutcome,
  ComplianceStatus,
  ContractStatus,
  DisciplineOutcome,
  DisciplineStatus,
  FaultSeverity,
  NotificationType,
} from '+/generated/prisma/client'
import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import { sendDisciplineNotice } from '+/lib/disciplineNotice'
import { sendSystemNotificationAction } from '+/actions/notifications'

// Plazo para presentar descargos desde la notificación (art. 229 del manual).
const DEFENSE_DAYS = 5
// Plazo para interponer reposición desde la decisión (art. 232).
const RECOURSE_DAYS = 5
const DAY_MS = 24 * 60 * 60 * 1000

export type CreateDisciplinaryCaseInput = {
  tenantId: string
  unitId: string
  severity: FaultSeverity
  description: string
  manualRef?: string | null
  occurredAt: string
}

const trimOrNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const nextNumber = async (year: number) => {
  const count = await prisma.disciplinaryCase.count({ where: { number: { startsWith: `DISC-${year}-` } } })
  return `DISC-${year}-${String(count + 1).padStart(4, '0')}`
}

const getTenantContact = async (tenantId: string) => {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { user: { select: { email: true, name: true, lastName: true } } },
  })
  return {
    email: tenant?.user.email ?? null,
    name: [tenant?.user.name, tenant?.user.lastName].filter(Boolean).join(' '),
  }
}

const notifyTenant = async ({ tenantId, title, body }: { tenantId: string; title: string; body: string }) => {
  await sendSystemNotificationAction({ tenantId, type: NotificationType.REMINDER, title, body, link: '/dashboard/tenant/discipline' })
  const contact = await getTenantContact(tenantId)
  await sendDisciplineNotice({ tenantEmail: contact.email, tenantName: contact.name, subject: title, message: body, link: '/dashboard/tenant/discipline' })
}

const getSessionTenant = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null
  return prisma.tenant.findUnique({ where: { userId }, select: { id: true } })
}

// Inquilinos con contrato activo en propiedades del admin que habilitaron el régimen disciplinario.
export const getDisciplineOptionsAction = async () => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const contracts = await prisma.contract.findMany({
      where: { status: ContractStatus.ACTIVE, unit: { property: { ...propertyAccessFilter(scope), disciplineEnabled: true } } },
      select: {
        tenantId: true,
        unitId: true,
        tenant: { select: { user: { select: { name: true, lastName: true, email: true } } } },
        unit: { select: { unitNumber: true, property: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return {
      success: true,
      data: contracts.map((contract) => ({
        tenantId: contract.tenantId,
        unitId: contract.unitId,
        label: `${[contract.tenant.user.name, contract.tenant.user.lastName].filter(Boolean).join(' ') || contract.tenant.user.email} · ${contract.unit.property.name} · Unidad ${contract.unit.unitNumber}`,
      })),
    }
  } catch (error) {
    console.error('Error en getDisciplineOptionsAction:', error)
    return { success: false, error: 'No se pudieron cargar los inquilinos' }
  }
}

export const createDisciplinaryCaseAction = async (input: CreateDisciplinaryCaseInput) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const description = trimOrNull(input.description)
    if (!description) return { success: false, error: 'Describe los hechos' }
    if (!Object.values(FaultSeverity).includes(input.severity)) return { success: false, error: 'Gravedad inválida' }
    const occurredAt = new Date(`${input.occurredAt}T12:00:00`)
    if (Number.isNaN(occurredAt.getTime())) return { success: false, error: 'Fecha de los hechos inválida' }

    const contract = await prisma.contract.findFirst({
      where: {
        tenantId: input.tenantId,
        unitId: input.unitId,
        status: ContractStatus.ACTIVE,
        unit: { property: propertyAccessFilter(scope) },
      },
      select: { unit: { select: { unitNumber: true, property: { select: { id: true, name: true, disciplineEnabled: true } } } } },
    })
    if (!contract) return { success: false, error: 'El inquilino no tiene contrato activo en esa unidad' }
    if (!contract.unit.property.disciplineEnabled) return { success: false, error: 'Esta propiedad no tiene habilitado el régimen disciplinario' }

    const now = new Date()
    const created = await prisma.disciplinaryCase.create({
      data: {
        number: await nextNumber(now.getFullYear()),
        severity: input.severity,
        description,
        manualRef: trimOrNull(input.manualRef),
        occurredAt,
        notifiedAt: now,
        defenseDeadline: new Date(now.getTime() + DEFENSE_DAYS * DAY_MS),
        createdById: scope.adminId,
        tenantId: input.tenantId,
        propertyId: contract.unit.property.id,
        unitId: input.unitId,
      },
      select: { id: true, number: true, defenseDeadline: true },
    })

    await notifyTenant({
      tenantId: input.tenantId,
      title: `Notificación disciplinaria ${created.number}`,
      body: `Se abrió un procedimiento por hechos ocurridos en ${contract.unit.property.name} (Unidad ${contract.unit.unitNumber}).\n\nHechos. ${description}\n\nPuedes presentar tus descargos hasta el ${created.defenseDeadline.toLocaleDateString('es-CO')}.`,
    })

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true, data: { number: created.number } }
  } catch (error) {
    console.error('Error en createDisciplinaryCaseAction:', error)
    return { success: false, error: 'No se pudo abrir el procedimiento' }
  }
}

const disciplineOutcomeText: Record<DisciplineOutcome, string> = {
  WARNING: 'Llamado de atención',
  CORRECTIVE_MEASURE: 'Medida correctiva',
  DISMISSED: 'Procedimiento archivado sin sanción',
}

const caseSelect = {
  id: true,
  number: true,
  severity: true,
  status: true,
  description: true,
  manualRef: true,
  occurredAt: true,
  notifiedAt: true,
  defenseDeadline: true,
  defense: true,
  defenseAt: true,
  outcome: true,
  decision: true,
  decidedAt: true,
  recourseDeadline: true,
  appeal: true,
  appealAt: true,
  appealOutcome: true,
  appealDecision: true,
  appealDecidedAt: true,
  complianceStatus: true,
  complianceNote: true,
  complianceCheckedAt: true,
  closedAt: true,
  property: { select: { name: true } },
  unit: { select: { unitNumber: true } },
} as const

export const getAdminDisciplinaryCasesAction = async () => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const cases = await prisma.disciplinaryCase.findMany({
      where: { property: propertyAccessFilter(scope) },
      orderBy: { createdAt: 'desc' },
      select: { ...caseSelect, tenant: { select: { user: { select: { name: true, lastName: true, email: true } } } } },
    })
    return { success: true, data: cases }
  } catch (error) {
    console.error('Error en getAdminDisciplinaryCasesAction:', error)
    return { success: false, error: 'No se pudieron cargar los procedimientos' }
  }
}

export type AdminDisciplinaryCase = NonNullable<Awaited<ReturnType<typeof getAdminDisciplinaryCasesAction>>['data']>[number]

export const decideDisciplinaryCaseAction = async ({
  caseId,
  outcome,
  decision,
}: {
  caseId: string
  outcome: DisciplineOutcome
  decision: string
}) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }
    if (!Object.values(DisciplineOutcome).includes(outcome)) return { success: false, error: 'Decisión inválida' }

    const motivation = trimOrNull(decision)
    if (!motivation) return { success: false, error: 'La decisión debe estar motivada' }

    const item = await prisma.disciplinaryCase.findFirst({
      where: { id: caseId, property: propertyAccessFilter(scope) },
      select: { id: true, number: true, status: true, tenantId: true, defenseDeadline: true },
    })
    if (!item) return { success: false, error: 'Procedimiento no encontrado' }
    if (item.status !== DisciplineStatus.NOTIFIED && item.status !== DisciplineStatus.DEFENSE_RECEIVED) {
      return { success: false, error: 'El procedimiento ya tiene decisión' }
    }
    const now = new Date()

    // Debido proceso: se decide con descargos recibidos o vencido el plazo.
    if (item.status === DisciplineStatus.NOTIFIED && item.defenseDeadline.getTime() > Date.now()) {
      return { success: false, error: `El plazo de descargos vence el ${item.defenseDeadline.toLocaleDateString('es-CO')}` }
    }

    await prisma.disciplinaryCase.update({
      where: { id: item.id },
      data: {
        status: DisciplineStatus.DECIDED,
        outcome,
        decision: motivation,
        decidedAt: now,
        decidedById: scope.adminId,
        recourseDeadline: outcome === DisciplineOutcome.DISMISSED ? null : new Date(now.getTime() + RECOURSE_DAYS * DAY_MS),
        complianceStatus: outcome === DisciplineOutcome.CORRECTIVE_MEASURE ? ComplianceStatus.PENDING : null,
      },
    })

    const recourseNote =
      outcome === DisciplineOutcome.DISMISSED ? '' : `\n\nPuedes interponer recurso de reposición hasta el ${new Date(now.getTime() + RECOURSE_DAYS * DAY_MS).toLocaleDateString('es-CO')}.`
    await notifyTenant({
      tenantId: item.tenantId,
      title: `Decisión del procedimiento ${item.number}`,
      body: `${disciplineOutcomeText[outcome]}.\n\n${motivation}${recourseNote}`,
    })

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true }
  } catch (error) {
    console.error('Error en decideDisciplinaryCaseAction:', error)
    return { success: false, error: 'No se pudo registrar la decisión' }
  }
}

export const getTenantDisciplinaryCasesAction = async () => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const cases = await prisma.disciplinaryCase.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      select: caseSelect,
    })
    return { success: true, data: cases }
  } catch (error) {
    console.error('Error en getTenantDisciplinaryCasesAction:', error)
    return { success: false, error: 'No se pudieron cargar los procedimientos' }
  }
}

export type TenantDisciplinaryCase = NonNullable<Awaited<ReturnType<typeof getTenantDisciplinaryCasesAction>>['data']>[number]

export const submitDefenseAction = async ({ caseId, defense }: { caseId: string; defense: string }) => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const text = trimOrNull(defense)
    if (!text) return { success: false, error: 'Escribe tus descargos' }

    const item = await prisma.disciplinaryCase.findFirst({
      where: { id: caseId, tenantId: tenant.id },
      select: {
        id: true,
        number: true,
        status: true,
        defenseDeadline: true,
        property: { select: { name: true, admins: { select: { id: true } } } },
      },
    })
    if (!item) return { success: false, error: 'Procedimiento no encontrado' }
    if (item.status !== DisciplineStatus.NOTIFIED) return { success: false, error: 'Ya no se pueden presentar descargos' }
    if (item.defenseDeadline.getTime() < Date.now()) return { success: false, error: 'El plazo de descargos venció' }

    await prisma.disciplinaryCase.update({
      where: { id: item.id },
      data: { status: DisciplineStatus.DEFENSE_RECEIVED, defense: text, defenseAt: new Date() },
    })

    await Promise.all(
      item.property.admins.map((admin) =>
        sendSystemNotificationAction({
          adminId: admin.id,
          type: NotificationType.TENANT_REPORT,
          title: `Descargos recibidos ${item.number}`,
          body: `${item.property.name}: el inquilino presentó sus descargos.`,
          link: '/dashboard/admin/discipline',
        })
      )
    )

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true }
  } catch (error) {
    console.error('Error en submitDefenseAction:', error)
    return { success: false, error: 'No se pudieron enviar los descargos' }
  }
}

// Reposición (art. 232): una sola vez, ante la misma autoridad, dentro del plazo posterior a la decisión.
export const fileAppealAction = async ({ caseId, appeal }: { caseId: string; appeal: string }) => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const text = trimOrNull(appeal)
    if (!text) return { success: false, error: 'Escribe los argumentos del recurso' }

    const item = await prisma.disciplinaryCase.findFirst({
      where: { id: caseId, tenantId: tenant.id },
      select: {
        id: true,
        number: true,
        status: true,
        outcome: true,
        appealAt: true,
        recourseDeadline: true,
        property: { select: { name: true, admins: { select: { id: true } } } },
      },
    })
    if (!item) return { success: false, error: 'Procedimiento no encontrado' }
    if (item.status !== DisciplineStatus.DECIDED || item.outcome === DisciplineOutcome.DISMISSED) {
      return { success: false, error: 'Esta decisión no admite recurso' }
    }
    if (item.appealAt) return { success: false, error: 'Ya presentaste el recurso de reposición' }
    if (!item.recourseDeadline || item.recourseDeadline.getTime() < Date.now()) return { success: false, error: 'El plazo para el recurso venció' }

    await prisma.disciplinaryCase.update({
      where: { id: item.id },
      data: { status: DisciplineStatus.APPEALED, appeal: text, appealAt: new Date() },
    })

    await Promise.all(
      item.property.admins.map((admin) =>
        sendSystemNotificationAction({
          adminId: admin.id,
          type: NotificationType.TENANT_REPORT,
          title: `Recurso de reposición ${item.number}`,
          body: `${item.property.name}: el inquilino interpuso recurso de reposición.`,
          link: '/dashboard/admin/discipline',
        })
      )
    )

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true }
  } catch (error) {
    console.error('Error en fileAppealAction:', error)
    return { success: false, error: 'No se pudo presentar el recurso' }
  }
}

// Resuelve la reposición. La autoridad que decidió confirma, modifica o revoca (art. 232).
export const resolveAppealAction = async ({
  caseId,
  appealOutcome,
  appealDecision,
  newOutcome,
}: {
  caseId: string
  appealOutcome: AppealOutcome
  appealDecision: string
  newOutcome?: DisciplineOutcome | null
}) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }
    if (!Object.values(AppealOutcome).includes(appealOutcome)) return { success: false, error: 'Resultado inválido' }

    const motivation = trimOrNull(appealDecision)
    if (!motivation) return { success: false, error: 'La resolución del recurso debe estar motivada' }

    const item = await prisma.disciplinaryCase.findFirst({
      where: { id: caseId, property: propertyAccessFilter(scope) },
      select: { id: true, number: true, status: true, tenantId: true, outcome: true, complianceStatus: true },
    })
    if (!item) return { success: false, error: 'Procedimiento no encontrado' }
    if (item.status !== DisciplineStatus.APPEALED) return { success: false, error: 'No hay un recurso pendiente' }

    let finalOutcome = item.outcome
    if (appealOutcome === AppealOutcome.REVOKED) finalOutcome = DisciplineOutcome.DISMISSED
    if (appealOutcome === AppealOutcome.MODIFIED) {
      if (!newOutcome || !Object.values(DisciplineOutcome).includes(newOutcome)) return { success: false, error: 'Indica la nueva decisión' }
      finalOutcome = newOutcome
    }

    const needsCompliance = finalOutcome === DisciplineOutcome.CORRECTIVE_MEASURE
    await prisma.disciplinaryCase.update({
      where: { id: item.id },
      data: {
        status: DisciplineStatus.DECIDED,
        appealOutcome,
        appealDecision: motivation,
        appealDecidedAt: new Date(),
        outcome: finalOutcome,
        complianceStatus: needsCompliance ? (item.complianceStatus ?? ComplianceStatus.PENDING) : null,
      },
    })

    const labels: Record<AppealOutcome, string> = { UPHELD: 'Decisión confirmada', MODIFIED: 'Decisión modificada', REVOKED: 'Decisión revocada' }
    await notifyTenant({
      tenantId: item.tenantId,
      title: `Resolución del recurso ${item.number}`,
      body: `${labels[appealOutcome]}.\n\n${motivation}`,
    })

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true }
  } catch (error) {
    console.error('Error en resolveAppealAction:', error)
    return { success: false, error: 'No se pudo resolver el recurso' }
  }
}

// Verificación del cumplimiento de la medida correctiva (art. 234).
export const verifyComplianceAction = async ({ caseId, status, note }: { caseId: string; status: ComplianceStatus; note?: string | null }) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }
    if (status !== ComplianceStatus.COMPLIED && status !== ComplianceStatus.NOT_COMPLIED) return { success: false, error: 'Estado inválido' }

    const item = await prisma.disciplinaryCase.findFirst({
      where: { id: caseId, property: propertyAccessFilter(scope) },
      select: { id: true, number: true, status: true, outcome: true, tenantId: true },
    })
    if (!item) return { success: false, error: 'Procedimiento no encontrado' }
    if (item.status !== DisciplineStatus.DECIDED || item.outcome !== DisciplineOutcome.CORRECTIVE_MEASURE) {
      return { success: false, error: 'Solo se verifica el cumplimiento de medidas correctivas ya decididas' }
    }

    const complianceNote = trimOrNull(note)
    await prisma.disciplinaryCase.update({
      where: { id: item.id },
      data: { complianceStatus: status, complianceNote, complianceCheckedAt: new Date() },
    })

    await notifyTenant({
      tenantId: item.tenantId,
      title: `Seguimiento del procedimiento ${item.number}`,
      body: `${status === ComplianceStatus.COMPLIED ? 'Medida correctiva cumplida' : 'Medida correctiva incumplida'}.${complianceNote ? `\n\n${complianceNote}` : ''}`,
    })

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true }
  } catch (error) {
    console.error('Error en verifyComplianceAction:', error)
    return { success: false, error: 'No se pudo registrar la verificación' }
  }
}

// Cierre y archivo del expediente (art. 235). Exige decisión firme y cumplimiento verificado si hubo medida correctiva.
export const closeDisciplinaryCaseAction = async (caseId: string) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const item = await prisma.disciplinaryCase.findFirst({
      where: { id: caseId, property: propertyAccessFilter(scope) },
      select: { id: true, status: true, outcome: true, appealAt: true, recourseDeadline: true, complianceStatus: true },
    })
    if (!item) return { success: false, error: 'Procedimiento no encontrado' }
    if (item.status !== DisciplineStatus.DECIDED) return { success: false, error: 'El procedimiento aún no tiene decisión firme' }

    const recourseOpen = !item.appealAt && item.recourseDeadline && item.recourseDeadline.getTime() > Date.now()
    if (recourseOpen) return { success: false, error: `El plazo de reposición vence el ${item.recourseDeadline!.toLocaleDateString('es-CO')}` }

    if (item.outcome === DisciplineOutcome.CORRECTIVE_MEASURE && item.complianceStatus === ComplianceStatus.PENDING) {
      return { success: false, error: 'Verifica el cumplimiento de la medida antes de cerrar' }
    }

    await prisma.disciplinaryCase.update({ where: { id: item.id }, data: { status: DisciplineStatus.CLOSED, closedAt: new Date() } })

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true }
  } catch (error) {
    console.error('Error en closeDisciplinaryCaseAction:', error)
    return { success: false, error: 'No se pudo cerrar el expediente' }
  }
}
