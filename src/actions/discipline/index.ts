'use server'

import { revalidatePath } from 'next/cache'
import { ContractStatus, DisciplineOutcome, DisciplineStatus, FaultSeverity, NotificationType } from '+/generated/prisma/client'
import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import { sendSystemNotificationAction } from '+/actions/notifications'

// Plazo para presentar descargos desde la notificación (art. 229 del manual).
const DEFENSE_DAYS = 5
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

    await sendSystemNotificationAction({
      tenantId: input.tenantId,
      type: NotificationType.REMINDER,
      title: `Notificación disciplinaria ${created.number}`,
      body: `Se abrió un procedimiento por hechos ocurridos en ${contract.unit.property.name} (Unidad ${contract.unit.unitNumber}). Puedes presentar tus descargos hasta el ${created.defenseDeadline.toLocaleDateString('es-CO')}.`,
      link: '/dashboard/tenant/discipline',
    })

    revalidatePath('/dashboard/admin/discipline')
    revalidatePath('/dashboard/tenant/discipline')
    return { success: true, data: { number: created.number } }
  } catch (error) {
    console.error('Error en createDisciplinaryCaseAction:', error)
    return { success: false, error: 'No se pudo abrir el procedimiento' }
  }
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
    if (item.status === DisciplineStatus.DECIDED) return { success: false, error: 'El procedimiento ya tiene decisión' }

    // Debido proceso: se decide con descargos recibidos o vencido el plazo.
    if (item.status === DisciplineStatus.NOTIFIED && item.defenseDeadline.getTime() > Date.now()) {
      return { success: false, error: `El plazo de descargos vence el ${item.defenseDeadline.toLocaleDateString('es-CO')}` }
    }

    await prisma.disciplinaryCase.update({
      where: { id: item.id },
      data: { status: DisciplineStatus.DECIDED, outcome, decision: motivation, decidedAt: new Date(), decidedById: scope.adminId },
    })

    await sendSystemNotificationAction({
      tenantId: item.tenantId,
      type: NotificationType.GENERAL,
      title: `Decisión del procedimiento ${item.number}`,
      body: motivation,
      link: '/dashboard/tenant/discipline',
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
