'use server'

import { revalidatePath } from 'next/cache'
import {
  AccessDeviceKind,
  AccessDeviceStatus,
  AccessRequestKind,
  AccessRequestStatus,
  ContractStatus,
  NotificationType,
  PackageStatus,
} from '+/generated/prisma/client'
import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import { sendSystemNotificationAction } from '+/actions/notifications'

const trimOrNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const parseDateTime = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const getSessionTenant = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null
  return prisma.tenant.findUnique({ where: { userId }, select: { id: true } })
}

const revalidateAccess = () => {
  revalidatePath('/dashboard/admin/access')
  revalidatePath('/dashboard/tenant/access')
}

// ───────────── Inquilino ─────────────

export const getTenantAccessContextAction = async () => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const contracts = await prisma.contract.findMany({
      where: { tenantId: tenant.id, status: ContractStatus.ACTIVE, unit: { property: { accessControlEnabled: true } } },
      select: { unit: { select: { id: true, unitNumber: true, property: { select: { name: true } } } } },
    })

    const [requests, packages] = await Promise.all([
      prisma.accessRequest.findMany({
        where: { tenantId: tenant.id },
        orderBy: { scheduledAt: 'desc' },
        take: 50,
        select: {
          id: true,
          kind: true,
          status: true,
          personName: true,
          details: true,
          scheduledAt: true,
          untilAt: true,
          decisionNote: true,
          unit: { select: { unitNumber: true } },
          property: { select: { name: true } },
        },
      }),
      prisma.packageRecord.findMany({
        where: { tenantId: tenant.id },
        orderBy: { receivedAt: 'desc' },
        take: 30,
        select: { id: true, status: true, description: true, carrier: true, receivedAt: true, deliveredAt: true, unit: { select: { unitNumber: true } } },
      }),
    ])

    return {
      success: true,
      data: {
        units: contracts.map((contract) => ({ id: contract.unit.id, label: `${contract.unit.property.name} · Unidad ${contract.unit.unitNumber}` })),
        requests,
        packages,
      },
    }
  } catch (error) {
    console.error('Error en getTenantAccessContextAction:', error)
    return { success: false, error: 'No se pudo cargar la información' }
  }
}

export type TenantAccessData = NonNullable<Awaited<ReturnType<typeof getTenantAccessContextAction>>['data']>

export const createAccessRequestAction = async (input: {
  unitId: string
  kind: AccessRequestKind
  personName?: string | null
  personId?: string | null
  details: string
  scheduledAt: string
  untilAt?: string | null
}) => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }
    if (!Object.values(AccessRequestKind).includes(input.kind)) return { success: false, error: 'Tipo inválido' }

    const details = trimOrNull(input.details)
    const scheduledAt = parseDateTime(input.scheduledAt)
    const untilAt = parseDateTime(input.untilAt)
    if (!details) return { success: false, error: 'Describe la solicitud' }
    if (!scheduledAt) return { success: false, error: 'Indica la fecha y hora' }
    if (untilAt && untilAt < scheduledAt) return { success: false, error: 'La fecha final es anterior al inicio' }

    const personName = trimOrNull(input.personName)
    if ((input.kind === AccessRequestKind.VISIT || input.kind === AccessRequestKind.CONTRACTOR) && !personName) {
      return { success: false, error: 'Indica el nombre de la persona que ingresa' }
    }

    const contract = await prisma.contract.findFirst({
      where: { tenantId: tenant.id, unitId: input.unitId, status: ContractStatus.ACTIVE },
      select: { unit: { select: { unitNumber: true, property: { select: { id: true, name: true, accessControlEnabled: true, admins: { select: { id: true } } } } } } },
    })
    if (!contract) return { success: false, error: 'No tienes un contrato activo en esta unidad' }
    const { unit } = contract
    if (!unit.property.accessControlEnabled) return { success: false, error: 'Esta propiedad no tiene habilitado el control de accesos' }

    // Una visita solo se registra (art. 79). El resto pide autorización del administrador.
    const isVisit = input.kind === AccessRequestKind.VISIT
    await prisma.accessRequest.create({
      data: {
        kind: input.kind,
        status: isVisit ? AccessRequestStatus.APPROVED : AccessRequestStatus.PENDING,
        personName,
        personId: trimOrNull(input.personId),
        details,
        scheduledAt,
        untilAt,
        tenantId: tenant.id,
        propertyId: unit.property.id,
        unitId: input.unitId,
      },
    })

    if (!isVisit) {
      await Promise.all(
        unit.property.admins.map((admin) =>
          sendSystemNotificationAction({
            adminId: admin.id,
            type: NotificationType.TENANT_REPORT,
            title: 'Nueva solicitud de autorización',
            body: `${unit.property.name} (Unidad ${unit.unitNumber}): ${details}`,
            link: '/dashboard/admin/access',
          })
        )
      )
    }

    revalidateAccess()
    return { success: true, data: { autoApproved: isVisit } }
  } catch (error) {
    console.error('Error en createAccessRequestAction:', error)
    return { success: false, error: 'No se pudo registrar la solicitud' }
  }
}

export const cancelAccessRequestAction = async (requestId: string) => {
  try {
    const tenant = await getSessionTenant()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const item = await prisma.accessRequest.findFirst({ where: { id: requestId, tenantId: tenant.id }, select: { id: true, status: true } })
    if (!item) return { success: false, error: 'Solicitud no encontrada' }
    if (item.status === AccessRequestStatus.CANCELLED || item.status === AccessRequestStatus.REJECTED) return { success: true }

    await prisma.accessRequest.update({ where: { id: item.id }, data: { status: AccessRequestStatus.CANCELLED } })
    revalidateAccess()
    return { success: true }
  } catch (error) {
    console.error('Error en cancelAccessRequestAction:', error)
    return { success: false, error: 'No se pudo cancelar la solicitud' }
  }
}

// ───────────── Administrador ─────────────

export const getAdminAccessDataAction = async () => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const propertyWhere = { ...propertyAccessFilter(scope), accessControlEnabled: true }

    const [requests, packages, keys, units] = await Promise.all([
      prisma.accessRequest.findMany({
        where: { property: propertyWhere },
        orderBy: [{ status: 'asc' }, { scheduledAt: 'desc' }],
        take: 100,
        select: {
          id: true,
          kind: true,
          status: true,
          personName: true,
          personId: true,
          details: true,
          scheduledAt: true,
          untilAt: true,
          decisionNote: true,
          property: { select: { name: true } },
          unit: { select: { unitNumber: true } },
          tenant: { select: { user: { select: { name: true, lastName: true } } } },
        },
      }),
      prisma.packageRecord.findMany({
        where: { property: propertyWhere },
        orderBy: { receivedAt: 'desc' },
        take: 100,
        select: {
          id: true,
          status: true,
          description: true,
          carrier: true,
          receivedAt: true,
          deliveredAt: true,
          property: { select: { name: true } },
          unit: { select: { unitNumber: true } },
        },
      }),
      prisma.keyRecord.findMany({
        where: { property: propertyWhere },
        orderBy: { issuedAt: 'desc' },
        take: 100,
        select: {
          id: true,
          kind: true,
          status: true,
          label: true,
          quantity: true,
          holder: true,
          notes: true,
          issuedAt: true,
          returnedAt: true,
          property: { select: { name: true } },
          unit: { select: { unitNumber: true } },
        },
      }),
      prisma.unit.findMany({
        where: { property: propertyWhere },
        orderBy: [{ property: { name: 'asc' } }, { unitNumber: 'asc' }],
        select: { id: true, unitNumber: true, property: { select: { id: true, name: true } } },
      }),
    ])

    return {
      success: true,
      data: {
        requests,
        packages,
        keys,
        units: units.map((unit) => ({ id: unit.id, propertyId: unit.property.id, label: `${unit.property.name} · Unidad ${unit.unitNumber}` })),
      },
    }
  } catch (error) {
    console.error('Error en getAdminAccessDataAction:', error)
    return { success: false, error: 'No se pudo cargar el control de accesos' }
  }
}

export type AdminAccessData = NonNullable<Awaited<ReturnType<typeof getAdminAccessDataAction>>['data']>

export const getPendingAccessRequestsCountAction = async () => {
  const scope = await getCurrentAdminScope()
  if (!scope) return 0
  return prisma.accessRequest.count({
    where: { status: AccessRequestStatus.PENDING, property: { ...propertyAccessFilter(scope), accessControlEnabled: true } },
  })
}

export const decideAccessRequestAction = async ({ requestId, approve, note }: { requestId: string; approve: boolean; note?: string | null }) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const item = await prisma.accessRequest.findFirst({
      where: { id: requestId, property: propertyAccessFilter(scope) },
      select: { id: true, status: true, tenantId: true, details: true },
    })
    if (!item) return { success: false, error: 'Solicitud no encontrada' }
    if (item.status !== AccessRequestStatus.PENDING) return { success: false, error: 'La solicitud ya fue resuelta' }

    const decisionNote = trimOrNull(note)
    if (!approve && !decisionNote) return { success: false, error: 'Indica el motivo del rechazo' }

    await prisma.accessRequest.update({
      where: { id: item.id },
      data: {
        status: approve ? AccessRequestStatus.APPROVED : AccessRequestStatus.REJECTED,
        decisionNote,
        decidedAt: new Date(),
        decidedById: scope.adminId,
      },
    })

    await sendSystemNotificationAction({
      tenantId: item.tenantId,
      type: approve ? NotificationType.APPROVAL : NotificationType.REJECTION,
      title: approve ? 'Solicitud autorizada' : 'Solicitud rechazada',
      body: `${item.details}${decisionNote ? `. ${decisionNote}` : ''}`,
      link: '/dashboard/tenant/access',
    })

    revalidateAccess()
    return { success: true }
  } catch (error) {
    console.error('Error en decideAccessRequestAction:', error)
    return { success: false, error: 'No se pudo registrar la decisión' }
  }
}

export const registerPackageAction = async ({ unitId, description, carrier }: { unitId: string; description: string; carrier?: string | null }) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const text = trimOrNull(description)
    if (!text) return { success: false, error: 'Describe el paquete' }

    const unit = await prisma.unit.findFirst({
      where: { id: unitId, property: { ...propertyAccessFilter(scope), accessControlEnabled: true } },
      select: {
        id: true,
        unitNumber: true,
        propertyId: true,
        property: { select: { name: true } },
        contracts: { where: { status: ContractStatus.ACTIVE }, take: 1, select: { tenantId: true } },
      },
    })
    if (!unit) return { success: false, error: 'Unidad no encontrada o sin control de accesos habilitado' }

    const tenantId = unit.contracts[0]?.tenantId ?? null
    await prisma.packageRecord.create({
      data: { description: text, carrier: trimOrNull(carrier), propertyId: unit.propertyId, unitId: unit.id, tenantId, receivedById: scope.adminId },
    })

    if (tenantId) {
      await sendSystemNotificationAction({
        tenantId,
        type: NotificationType.GENERAL,
        title: 'Tienes un paquete en administración',
        body: `${text}${carrier?.trim() ? ` (${carrier.trim()})` : ''}. Puedes recogerlo en ${unit.property.name}.`,
        link: '/dashboard/tenant/access',
      })
    }

    revalidateAccess()
    return { success: true }
  } catch (error) {
    console.error('Error en registerPackageAction:', error)
    return { success: false, error: 'No se pudo registrar el paquete' }
  }
}

export const markPackageDeliveredAction = async (packageId: string) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const item = await prisma.packageRecord.findFirst({ where: { id: packageId, property: propertyAccessFilter(scope) }, select: { id: true } })
    if (!item) return { success: false, error: 'Paquete no encontrado' }

    await prisma.packageRecord.update({ where: { id: item.id }, data: { status: PackageStatus.DELIVERED, deliveredAt: new Date() } })
    revalidateAccess()
    return { success: true }
  } catch (error) {
    console.error('Error en markPackageDeliveredAction:', error)
    return { success: false, error: 'No se pudo actualizar el paquete' }
  }
}

export const registerKeyAction = async (input: {
  propertyId: string
  unitId?: string | null
  kind: AccessDeviceKind
  label: string
  quantity: number
  holder: string
  notes?: string | null
}) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const label = trimOrNull(input.label)
    const holder = trimOrNull(input.holder)
    if (!label || !holder) return { success: false, error: 'Completa la descripción y quién la recibe' }
    if (!Object.values(AccessDeviceKind).includes(input.kind)) return { success: false, error: 'Tipo inválido' }
    const quantity = Math.trunc(input.quantity)
    if (!Number.isFinite(quantity) || quantity < 1) return { success: false, error: 'La cantidad debe ser al menos 1' }

    const property = await prisma.property.findFirst({
      where: { id: input.propertyId, ...propertyAccessFilter(scope), accessControlEnabled: true },
      select: { id: true },
    })
    if (!property) return { success: false, error: 'Propiedad no encontrada o sin control de accesos habilitado' }

    if (input.unitId) {
      const unit = await prisma.unit.findFirst({ where: { id: input.unitId, propertyId: property.id }, select: { id: true } })
      if (!unit) return { success: false, error: 'La unidad no pertenece a la propiedad' }
    }

    await prisma.keyRecord.create({
      data: {
        propertyId: property.id,
        unitId: input.unitId || null,
        kind: input.kind,
        label,
        quantity,
        holder,
        notes: trimOrNull(input.notes),
      },
    })

    revalidateAccess()
    return { success: true }
  } catch (error) {
    console.error('Error en registerKeyAction:', error)
    return { success: false, error: 'No se pudo registrar la llave' }
  }
}

export const updateKeyStatusAction = async ({ keyId, status }: { keyId: string; status: AccessDeviceStatus }) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }
    if (!Object.values(AccessDeviceStatus).includes(status)) return { success: false, error: 'Estado inválido' }

    const item = await prisma.keyRecord.findFirst({ where: { id: keyId, property: propertyAccessFilter(scope) }, select: { id: true } })
    if (!item) return { success: false, error: 'Registro no encontrado' }

    await prisma.keyRecord.update({
      where: { id: item.id },
      data: { status, returnedAt: status === AccessDeviceStatus.RETURNED ? new Date() : null },
    })
    revalidateAccess()
    return { success: true }
  } catch (error) {
    console.error('Error en updateKeyStatusAction:', error)
    return { success: false, error: 'No se pudo actualizar el registro' }
  }
}
