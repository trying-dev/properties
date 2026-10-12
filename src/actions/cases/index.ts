'use server'

import { revalidatePath } from 'next/cache'
import { CaseKind, CaseStatus, ContractStatus, NotificationType, SecurityDeviceType } from '+/generated/prisma/client'
import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import { sendNotificationAction, sendSystemNotificationAction } from '+/actions/notifications'

export type CreateCaseInput = {
  unitId: string
  kind: CaseKind
  subject: string
  description: string
}

export type RespondCaseInput = {
  caseId: string
  status: CaseStatus
  response?: string | null
}

const EMERGENCY_DEVICE_TYPES: SecurityDeviceType[] = [SecurityDeviceType.EXTINGUISHER, SecurityDeviceType.ALARM, SecurityDeviceType.DETECTOR]

const getSessionTenant = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null
  return prisma.tenant.findUnique({ where: { userId }, select: { id: true } })
}

// Radicado por año: PQRS-2026-0001. Si dos casos colisionan, el índice único obliga a reintentar.
const nextCaseNumber = async (year: number) => {
  const count = await prisma.tenantCase.count({ where: { number: { startsWith: `PQRS-${year}-` } } })
  return `PQRS-${year}-${String(count + 1).padStart(4, '0')}`
}

// Unidades del inquilino con contrato activo en propiedades que habilitaron casos.
export const getTenantCaseContextAction = async () => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const contracts = await prisma.contract.findMany({
      where: { tenantId: tenant.id, status: ContractStatus.ACTIVE },
      select: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: {
              select: {
                id: true,
                name: true,
                casesEnabled: true,
                emergencyInfo: true,
                devices: {
                  where: { active: true, type: { in: EMERGENCY_DEVICE_TYPES } },
                  select: { id: true, type: true, location: true },
                },
              },
            },
          },
        },
      },
    })

    const units = contracts.map((contract) => contract.unit)
    const propertiesById = new Map(units.map((unit) => [unit.property.id, unit.property]))

    return {
      success: true,
      data: {
        units: units
          .filter((unit) => unit.property.casesEnabled)
          .map((unit) => ({ id: unit.id, unitNumber: unit.unitNumber, propertyName: unit.property.name })),
        emergency: [...propertiesById.values()]
          .filter((property) => property.emergencyInfo?.trim() || property.devices.length > 0)
          .map((property) => ({
            propertyId: property.id,
            propertyName: property.name,
            info: property.emergencyInfo?.trim() ?? null,
            devices: property.devices,
          })),
      },
    }
  } catch (error) {
    console.error('Error en getTenantCaseContextAction:', error)
    return { success: false, error: 'No se pudo cargar la información' }
  }
}

export type TenantCaseContext = NonNullable<Awaited<ReturnType<typeof getTenantCaseContextAction>>['data']>

export const getTenantCasesAction = async () => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const cases = await prisma.tenantCase.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        number: true,
        kind: true,
        status: true,
        subject: true,
        description: true,
        response: true,
        respondedAt: true,
        createdAt: true,
        property: { select: { name: true } },
        unit: { select: { unitNumber: true } },
      },
    })
    return { success: true, data: cases }
  } catch (error) {
    console.error('Error en getTenantCasesAction:', error)
    return { success: false, error: 'No se pudieron cargar tus casos' }
  }
}

export type TenantCaseItem = NonNullable<Awaited<ReturnType<typeof getTenantCasesAction>>['data']>[number]

export const createCaseAction = async (input: CreateCaseInput) => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const subject = input.subject?.trim()
    const description = input.description?.trim()
    if (!subject || !description) return { success: false, error: 'Completa el asunto y la descripción' }
    if (!Object.values(CaseKind).includes(input.kind)) return { success: false, error: 'Tipo de caso inválido' }

    const contract = await prisma.contract.findFirst({
      where: { tenantId: tenant.id, unitId: input.unitId, status: ContractStatus.ACTIVE },
      select: {
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: { select: { id: true, name: true, casesEnabled: true, admins: { select: { id: true } } } },
          },
        },
      },
    })
    if (!contract) return { success: false, error: 'No tienes un contrato activo en esta unidad' }

    const { unit } = contract
    if (!unit.property.casesEnabled) return { success: false, error: 'Esta propiedad no tiene habilitados los reportes' }

    const year = new Date().getFullYear()
    let created: { id: string; number: string } | null = null
    for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
      try {
        created = await prisma.tenantCase.create({
          data: {
            number: await nextCaseNumber(year),
            kind: input.kind,
            subject,
            description,
            tenantId: tenant.id,
            propertyId: unit.property.id,
            unitId: unit.id,
          },
          select: { id: true, number: true },
        })
      } catch (error) {
        if (attempt === 2) throw error
      }
    }
    if (!created) return { success: false, error: 'No se pudo radicar el caso' }

    await Promise.all(
      unit.property.admins.map((admin) =>
        sendSystemNotificationAction({
          adminId: admin.id,
          type: NotificationType.TENANT_REPORT,
          title: `Nuevo caso ${created!.number}`,
          body: `${unit.property.name} (Unidad ${unit.unitNumber}): ${subject}`,
          link: '/dashboard/admin/cases',
        })
      )
    )

    revalidatePath('/dashboard/tenant/cases')
    revalidatePath('/dashboard/admin/cases')
    return { success: true, data: { number: created.number } }
  } catch (error) {
    console.error('Error en createCaseAction:', error)
    return { success: false, error: 'No se pudo radicar el caso' }
  }
}

export const getAdminCasesAction = async () => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const cases = await prisma.tenantCase.findMany({
      where: { property: propertyAccessFilter(scope) },
      orderBy: [{ createdAt: 'desc' }],
      select: {
        id: true,
        number: true,
        kind: true,
        status: true,
        subject: true,
        description: true,
        response: true,
        respondedAt: true,
        createdAt: true,
        property: { select: { name: true } },
        unit: { select: { unitNumber: true } },
        tenant: { select: { user: { select: { name: true, lastName: true, email: true, phone: true } } } },
      },
    })
    return { success: true, data: cases }
  } catch (error) {
    console.error('Error en getAdminCasesAction:', error)
    return { success: false, error: 'No se pudieron cargar los casos' }
  }
}

export type AdminCaseItem = NonNullable<Awaited<ReturnType<typeof getAdminCasesAction>>['data']>[number]

export const getOpenCasesCountAction = async () => {
  const scope = await getCurrentAdminScope()
  if (!scope) return 0
  return prisma.tenantCase.count({
    where: { status: { in: [CaseStatus.OPEN, CaseStatus.IN_PROGRESS] }, property: propertyAccessFilter(scope) },
  })
}

export const respondCaseAction = async (input: RespondCaseInput) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }
    if (!Object.values(CaseStatus).includes(input.status)) return { success: false, error: 'Estado inválido' }

    const item = await prisma.tenantCase.findFirst({
      where: { id: input.caseId, property: propertyAccessFilter(scope) },
      select: { id: true, number: true, tenantId: true, response: true },
    })
    if (!item) return { success: false, error: 'Caso no encontrado' }

    const response = input.response?.trim() || null
    if ((input.status === CaseStatus.RESOLVED || input.status === CaseStatus.CLOSED) && !response && !item.response) {
      return { success: false, error: 'Escribe una respuesta para resolver o cerrar el caso' }
    }

    await prisma.tenantCase.update({
      where: { id: item.id },
      data: {
        status: input.status,
        response: response ?? item.response,
        respondedAt: response ? new Date() : undefined,
        respondedById: scope.adminId,
      },
    })

    await sendSystemNotificationAction({
      tenantId: item.tenantId,
      type: NotificationType.GENERAL,
      title: `Actualización de tu caso ${item.number}`,
      body: response ?? 'Tu caso cambió de estado.',
      link: '/dashboard/tenant/cases',
    })

    revalidatePath('/dashboard/admin/cases')
    revalidatePath('/dashboard/tenant/cases')
    return { success: true }
  } catch (error) {
    console.error('Error en respondCaseAction:', error)
    return { success: false, error: 'No se pudo guardar la respuesta' }
  }
}

// Reporte rápido desde la unidad. Si la propiedad habilitó casos queda radicado como PROBLEMA;
// si no, conserva el aviso directo al administrador (sin radicado).
export const reportUnitProblemAction = async ({ unitId, title, body }: { unitId: string; title?: string | null; body: string }) => {
  try {
    const description = body?.trim()
    if (!description) return { success: false, error: 'Describe la novedad' }

    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { property: { select: { casesEnabled: true } } },
    })
    if (!unit) return { success: false, error: 'Unidad no encontrada' }

    if (unit.property.casesEnabled) {
      const result = await createCaseAction({
        unitId,
        kind: CaseKind.PROBLEM,
        subject: title?.trim() || 'Problema en la unidad',
        description,
      })
      if (!result.success) return { success: false, error: result.error }
      return { success: true, data: { number: result.data?.number ?? null } }
    }

    const result = await sendNotificationAction({
      unitId,
      title: title?.trim() || 'Novedad de la unidad',
      body: description,
      type: NotificationType.TENANT_REPORT,
    })
    if (!result.success) return { success: false, error: result.error }
    return { success: true, data: { number: null as string | null } }
  } catch (error) {
    console.error('Error en reportUnitProblemAction:', error)
    return { success: false, error: 'No se pudo enviar el reporte' }
  }
}
