'use server'

import { revalidatePath } from 'next/cache'
import { ContractStatus, NotificationType, ProcessStatus, UnitStatus } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'
import { hasAcceptedManual } from '+/lib/manualAcceptance'
import { closeCompetingApplications, releaseUnitIfUnclaimed } from '+/lib/applications/closure'
import { generateMonthlyPaymentsForActiveContracts } from '+/lib/payments/monthly'
import { sendSystemNotificationAction } from '+/actions/notifications'

export type ContractTermsInput = {
  processId: string
  rent: number
  deposit: number
  securityDeposit?: number | null
  commissionRate: number
  lateFeePenalty?: number | null
  gracePeriodDays: number
  startDate: string
  endDate: string
  terms?: string | null
}

const DAY_MS = 24 * 60 * 60 * 1000

const trimOrNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const parseDate = (value: string) => {
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const requireScope = async () => {
  const scope = await getCurrentAdminScope()
  if (!scope) return { ok: false as const, error: 'Solo administradores pueden gestionar contratos' }
  return { ok: true as const, scope }
}

const contractLink = '/dashboard/tenant/processes'

const revalidateContractViews = (processId?: string | null) => {
  if (processId) revalidatePath(`/dashboard/admin/applications/${processId}`)
  revalidatePath('/dashboard/admin/applications')
  revalidatePath('/dashboard/tenant/processes')
}

const loadContractOwnerProcess = async (contractId: string) =>
  prisma.process.findFirst({ where: { contractId }, select: { id: true } })

export const getProcessContractAction = async (processId: string) => {
  try {
    const access = await requireScope()
    if (!access.ok) return { success: false, error: access.error }

    const process = await prisma.process.findFirst({
      where: { id: processId, unit: { property: propertyAccessFilter(access.scope) } },
      select: {
        id: true,
        status: true,
        tenant: { select: { userId: true } },
        unit: {
          select: {
            id: true,
            baseRent: true,
            deposit: true,
            property: { select: { requiresManualAcceptance: true } },
          },
        },
        contract: {
          select: {
            id: true,
            status: true,
            rent: true,
            deposit: true,
            securityDeposit: true,
            commissionRate: true,
            lateFeePenalty: true,
            gracePeriodDays: true,
            startDate: true,
            endDate: true,
            terms: true,
            signedAt: true,
            activatedAt: true,
            cancellationReason: true,
          },
        },
      },
    })
    if (!process) return { success: false, error: 'Proceso no encontrado' }

    const requiresManual = process.unit?.property.requiresManualAcceptance ?? true
    const manualAccepted = process.tenant?.userId ? await hasAcceptedManual(process.tenant.userId) : false

    return {
      success: true,
      data: {
        processId: process.id,
        processStatus: process.status,
        contract: process.contract,
        defaults: { rent: process.unit?.baseRent ?? 0, deposit: process.unit?.deposit ?? process.unit?.baseRent ?? 0 },
        requiresManual,
        manualAccepted,
      },
    }
  } catch (error) {
    console.error('Error en getProcessContractAction:', error)
    return { success: false, error: 'No se pudo cargar el contrato' }
  }
}

export type ProcessContractData = NonNullable<Awaited<ReturnType<typeof getProcessContractAction>>['data']>

// APPROVED → DRAFT: el admin fija las condiciones. Crea el contrato si la solicitud nació sin uno.
export const saveContractTermsAction = async (input: ContractTermsInput) => {
  try {
    const access = await requireScope()
    if (!access.ok) return { success: false, error: access.error }

    const startDate = parseDate(input.startDate)
    const endDate = parseDate(input.endDate)
    if (!startDate || !endDate) return { success: false, error: 'Fechas inválidas' }
    if (endDate <= startDate) return { success: false, error: 'La fecha de fin debe ser posterior al inicio' }
    if (!(input.rent > 0)) return { success: false, error: 'El canon debe ser mayor a cero' }
    if (input.deposit < 0) return { success: false, error: 'El depósito no puede ser negativo' }
    if (input.commissionRate < 0 || input.commissionRate > 100) return { success: false, error: 'La comisión va de 0 a 100' }

    const process = await prisma.process.findFirst({
      where: { id: input.processId, unit: { property: propertyAccessFilter(access.scope) } },
      select: {
        id: true,
        status: true,
        tenantId: true,
        unitId: true,
        contract: { select: { id: true, status: true } },
        unit: { select: { status: true } },
      },
    })
    if (!process) return { success: false, error: 'Proceso no encontrado' }
    if (process.status !== ProcessStatus.APPROVED) return { success: false, error: 'La solicitud debe estar aprobada' }
    if (!process.tenantId || !process.unitId) return { success: false, error: 'La solicitud no tiene inquilino o unidad' }

    const existing = process.contract
    const editableStatuses: ContractStatus[] = [ContractStatus.INITIATED, ContractStatus.UNDER_REVIEW, ContractStatus.DOCUMENTATION, ContractStatus.APPROVED, ContractStatus.DRAFT]
    if (existing && !editableStatuses.includes(existing.status)) {
      return { success: false, error: 'El contrato ya no admite cambios de condiciones' }
    }
    const claimableUnitStatuses: UnitStatus[] = [UnitStatus.VACANT, UnitStatus.RESERVED]
    if (process.unit?.status && !claimableUnitStatuses.includes(process.unit.status)) {
      return { success: false, error: 'La unidad ya no está disponible' }
    }

    const data = {
      rent: input.rent,
      deposit: input.deposit,
      securityDeposit: input.securityDeposit ?? null,
      commissionRate: input.commissionRate,
      lateFeePenalty: input.lateFeePenalty ?? null,
      gracePeriodDays: input.gracePeriodDays,
      startDate,
      endDate,
      terms: trimOrNull(input.terms),
      status: ContractStatus.DRAFT,
      approvedAt: new Date(),
    }

    const contractId = await prisma.$transaction(async (tx) => {
      let id: string
      if (existing) {
        await tx.contract.update({ where: { id: existing.id }, data })
        id = existing.id
      } else {
        const created = await tx.contract.create({
          data: { ...data, unitId: process.unitId!, tenantId: process.tenantId!, adminId: access.scope.adminId, admins: { connect: [{ id: access.scope.adminId }] } },
          select: { id: true },
        })
        id = created.id
        await tx.process.update({ where: { id: process.id }, data: { contractId: id } })
      }
      if (process.unit?.status === UnitStatus.VACANT) {
        await tx.unit.update({ where: { id: process.unitId! }, data: { status: UnitStatus.RESERVED } })
      }
      await tx.process.update({ where: { id: process.id }, data: { updatedAt: new Date() } })
      return id
    })

    revalidateContractViews(process.id)
    return { success: true, data: { contractId } }
  } catch (error) {
    console.error('Error en saveContractTermsAction:', error)
    return { success: false, error: 'No se pudieron guardar las condiciones. Verifica que no exista otro contrato con la misma fecha de inicio.' }
  }
}

// DRAFT → PENDING: queda a la espera de firma. Vuelve a verificar el manual si la propiedad lo exige.
export const sendContractToSignatureAction = async (contractId: string) => {
  try {
    const access = await requireScope()
    if (!access.ok) return { success: false, error: access.error }

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, unit: { property: propertyAccessFilter(access.scope) } },
      select: {
        id: true,
        status: true,
        tenantId: true,
        tenant: { select: { userId: true } },
        unit: { select: { unitNumber: true, property: { select: { name: true, requiresManualAcceptance: true } } } },
      },
    })
    if (!contract) return { success: false, error: 'Contrato no encontrado' }
    if (contract.status !== ContractStatus.DRAFT) return { success: false, error: 'El contrato debe estar en borrador' }

    if (contract.unit.property.requiresManualAcceptance && !(await hasAcceptedManual(contract.tenant.userId))) {
      await sendSystemNotificationAction({
        tenantId: contract.tenantId,
        type: NotificationType.REMINDER,
        title: 'Acepta el Manual de Convivencia',
        body: 'Para avanzar con tu contrato necesitamos que leas y aceptes el Manual de Convivencia.',
        link: '/manual',
      })
      return { success: false, error: 'El inquilino aún no aceptó el Manual de Convivencia. Se le envió un recordatorio.' }
    }

    await prisma.contract.update({ where: { id: contract.id }, data: { status: ContractStatus.PENDING } })

    await sendSystemNotificationAction({
      tenantId: contract.tenantId,
      type: NotificationType.GENERAL,
      title: 'Tu contrato está listo para firma',
      body: `El contrato de ${contract.unit.property.name} (Unidad ${contract.unit.unitNumber}) está listo. El administrador coordinará la firma contigo.`,
      link: contractLink,
    })

    const owner = await loadContractOwnerProcess(contract.id)
    if (owner) await prisma.process.update({ where: { id: owner.id }, data: { updatedAt: new Date() } })
    revalidateContractViews(owner?.id)
    return { success: true }
  } catch (error) {
    console.error('Error en sendContractToSignatureAction:', error)
    return { success: false, error: 'No se pudo enviar el contrato a firma' }
  }
}

// PENDING → ACTIVE: firma en papel registrada por el admin. Ocupa la unidad y arranca los pagos.
export const registerContractSignatureAction = async ({ contractId, signedAt }: { contractId: string; signedAt: string }) => {
  try {
    const access = await requireScope()
    if (!access.ok) return { success: false, error: access.error }

    const signedDate = parseDate(signedAt)
    if (!signedDate) return { success: false, error: 'Fecha de firma inválida' }
    if (signedDate.getTime() > Date.now() + DAY_MS) return { success: false, error: 'La fecha de firma no puede ser futura' }

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, unit: { property: propertyAccessFilter(access.scope) } },
      select: {
        id: true,
        status: true,
        unitId: true,
        tenantId: true,
        startDate: true,
        tenant: { select: { userId: true } },
        unit: { select: { unitNumber: true, status: true, property: { select: { name: true, requiresManualAcceptance: true } } } },
      },
    })
    if (!contract) return { success: false, error: 'Contrato no encontrado' }
    if (contract.status !== ContractStatus.PENDING) return { success: false, error: 'El contrato debe estar pendiente de firma' }
    if (contract.unit.status === UnitStatus.OCCUPIED) return { success: false, error: 'La unidad ya está ocupada' }

    if (contract.unit.property.requiresManualAcceptance && !(await hasAcceptedManual(contract.tenant.userId))) {
      return { success: false, error: 'El inquilino aún no aceptó el Manual de Convivencia' }
    }

    await prisma.$transaction([
      prisma.contract.update({
        where: { id: contract.id },
        data: { status: ContractStatus.ACTIVE, signedAt: signedDate, activatedAt: new Date() },
      }),
      prisma.unit.update({ where: { id: contract.unitId }, data: { status: UnitStatus.OCCUPIED } }),
    ])

    const owner = await loadContractOwnerProcess(contract.id)
    const competing = await closeCompetingApplications({ unitId: contract.unitId, winnerProcessId: owner?.id })

    if (contract.startDate.getTime() <= Date.now()) {
      await generateMonthlyPaymentsForActiveContracts().catch((error) => console.error('Error generando primer pago:', error))
    }

    await sendSystemNotificationAction({
      tenantId: contract.tenantId,
      type: NotificationType.APPROVAL,
      title: 'Tu contrato está activo',
      body: `Tu contrato de ${contract.unit.property.name} (Unidad ${contract.unit.unitNumber}) quedó activo. Bienvenido.`,
      link: '/dashboard/tenant',
    })

    revalidateContractViews(owner?.id)
    revalidatePath('/dashboard/admin/units')
    return { success: true, data: { competingClosed: competing.closed } }
  } catch (error) {
    console.error('Error en registerContractSignatureAction:', error)
    return { success: false, error: 'No se pudo registrar la firma' }
  }
}

// Cualquier contrato sin firmar → CANCELLED, y la unidad se libera si nadie más la reclama.
export const cancelContractAction = async ({ contractId, reason }: { contractId: string; reason?: string | null }) => {
  try {
    const access = await requireScope()
    if (!access.ok) return { success: false, error: access.error }

    const contract = await prisma.contract.findFirst({
      where: { id: contractId, unit: { property: propertyAccessFilter(access.scope) } },
      select: { id: true, status: true, unitId: true, tenantId: true },
    })
    if (!contract) return { success: false, error: 'Contrato no encontrado' }
    const closedStatuses: ContractStatus[] = [ContractStatus.ACTIVE, ContractStatus.CANCELLED, ContractStatus.TERMINATED, ContractStatus.EXPIRED, ContractStatus.RENEWED]
    if (closedStatuses.includes(contract.status)) {
      return { success: false, error: 'Este contrato ya no se puede cancelar desde aquí' }
    }

    const cancellationReason = trimOrNull(reason) ?? 'Cancelado por el administrador'
    await prisma.contract.update({
      where: { id: contract.id },
      data: { status: ContractStatus.CANCELLED, cancellationReason },
    })

    const owner = await loadContractOwnerProcess(contract.id)
    if (owner) {
      await prisma.process.update({ where: { id: owner.id }, data: { status: ProcessStatus.CANCELLED, notes: cancellationReason } })
    }
    await releaseUnitIfUnclaimed(contract.unitId)

    await sendSystemNotificationAction({
      tenantId: contract.tenantId,
      type: NotificationType.REJECTION,
      title: 'Tu contrato fue cancelado',
      body: cancellationReason,
      link: contractLink,
    })

    revalidateContractViews(owner?.id)
    revalidatePath('/dashboard/admin/units')
    return { success: true }
  } catch (error) {
    console.error('Error en cancelContractAction:', error)
    return { success: false, error: 'No se pudo cancelar el contrato' }
  }
}
