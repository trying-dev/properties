'use server'

import { Prisma, ProcessStatus } from '@prisma/client'
import { prisma } from '+/lib/prisma'

type CreateProcessInput = {
  tenantId?: string | null
  unitId?: string | null
  adminId?: string | null
  contractId?: string | null
  payload?: unknown
  currentStep?: number
}

export const createProcessAction = async (input: CreateProcessInput) => {
  try {
    const tenantId = input.tenantId?.trim() || null
    const unitId = input.unitId?.trim() || null
    const adminId = input.adminId?.trim() || null
    const contractId = input.contractId?.trim() || null

    const [tenantExists, unitExists, adminExists, contractExists] = await Promise.all([
      tenantId ? prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } }) : Promise.resolve(null),
      unitId ? prisma.unit.findUnique({ where: { id: unitId }, select: { id: true } }) : Promise.resolve(null),
      adminId ? prisma.admin.findUnique({ where: { id: adminId }, select: { id: true } }) : Promise.resolve(null),
      contractId ? prisma.contract.findUnique({ where: { id: contractId }, select: { id: true } }) : Promise.resolve(null),
    ])

    const data: Prisma.ProcessUncheckedCreateInput = {
      currentStep: input.currentStep ?? 1,
      status: ProcessStatus.IN_PROGRESS,
      payload: (input.payload ?? {}) as Prisma.InputJsonValue,
    }

    if (tenantExists) data.tenantId = tenantId
    if (unitExists) data.unitId = unitId
    if (adminExists) data.adminId = adminId
    if (contractExists) data.contractId = contractId

    const process = await prisma.process.create({
      data,
      select: { id: true },
    })

    return { success: true, data: process }
  } catch (error) {
    console.error('Error en createProcessAction:', error)
    return { success: false, error: 'No se pudo crear el proceso' }
  }
}

type UpdateProcessInput = {
  processId: string
  payloadPatch?: unknown
  currentStep?: number
  status?: ProcessStatus
  tenantId?: string | null
  unitId?: string | null
  adminId?: string | null
  contractId?: string | null
}

export const updateProcessAction = async (input: UpdateProcessInput) => {
  const { processId, payloadPatch, currentStep, status } = input
  try {
    const existing = await prisma.process.findUnique({
      where: { id: processId },
      select: { payload: true },
    })

    if (!existing) {
      return { success: false, error: 'Proceso no encontrado' }
    }

    const mergedPayload =
      payloadPatch !== undefined
        ? {
            ...(existing.payload as Record<string, unknown> | null | undefined),
            ...(payloadPatch as Record<string, unknown>),
          }
        : undefined

    const data: Prisma.ProcessUncheckedUpdateInput = {}
    if (mergedPayload !== undefined) data.payload = mergedPayload as Prisma.InputJsonValue
    if (currentStep !== undefined) data.currentStep = currentStep
    if (status) data.status = status

    const tenantId = input.tenantId?.trim()
    const unitId = input.unitId?.trim()
    const adminId = input.adminId?.trim()
    const contractId = input.contractId?.trim()

    const [tenantExists, unitExists, adminExists, contractExists] = await Promise.all([
      tenantId !== undefined
        ? tenantId
          ? prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } })
          : Promise.resolve(null)
        : Promise.resolve(undefined),
      unitId !== undefined
        ? unitId
          ? prisma.unit.findUnique({ where: { id: unitId }, select: { id: true } })
          : Promise.resolve(null)
        : Promise.resolve(undefined),
      adminId !== undefined
        ? adminId
          ? prisma.admin.findUnique({ where: { id: adminId }, select: { id: true } })
          : Promise.resolve(null)
        : Promise.resolve(undefined),
      contractId !== undefined
        ? contractId
          ? prisma.contract.findUnique({ where: { id: contractId }, select: { id: true } })
          : Promise.resolve(null)
        : Promise.resolve(undefined),
    ])

    if (tenantExists !== undefined) data.tenantId = tenantExists ? tenantId : null
    if (unitExists !== undefined) data.unitId = unitExists ? unitId : null
    if (adminExists !== undefined) data.adminId = adminExists ? adminId : null
    if (contractExists !== undefined) data.contractId = contractExists ? contractId : null

    await prisma.process.update({
      where: { id: processId },
      data,
    })

    return { success: true }
  } catch (error) {
    console.error('Error en updateProcessAction:', error)
    return { success: false, error: 'No se pudo actualizar el proceso' }
  }
}

export const getProcessAction = async (processId: string) => {
  if (!processId) return { success: false, error: 'Falta processId' }
  try {
    const process = await prisma.process.findUnique({
      where: { id: processId },
      select: {
        id: true,
        payload: true,
        currentStep: true,
        tenantId: true,
        unitId: true,
      },
    })

    if (!process) return { success: false, error: 'Proceso no encontrado' }
    return { success: true, data: process }
  } catch (error) {
    console.error('Error en getProcessAction:', error)
    return { success: false, error: 'No se pudo obtener el proceso' }
  }
}

export const getProcessDetailsAction = async (processId: string) => {
  if (!processId) return { success: false, error: 'Falta processId' }
  try {
    const process = await prisma.process.findUnique({
      where: { id: processId },
      select: {
        id: true,
        status: true,
        currentStep: true,
        createdAt: true,
        updatedAt: true,
        payload: true,
        tenant: {
          select: {
            id: true,
            user: { select: { name: true, lastName: true, email: true, phone: true } },
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: { select: { id: true, name: true, city: true } },
          },
        },
      },
    })

    if (!process) return { success: false, error: 'Proceso no encontrado' }
    return { success: true, data: process }
  } catch (error) {
    console.error('Error en getProcessDetailsAction:', error)
    return { success: false, error: 'No se pudo obtener el detalle del proceso' }
  }
}

export type ProcessDetail = NonNullable<Awaited<ReturnType<typeof getProcessDetailsAction>>['data']>

export const getTenantProcessesAction = async (tenantId: string) => {
  if (!tenantId) return { success: false, error: 'Falta tenantId' }
  try {
    const processes = await prisma.process.findMany({
      where: { tenantId },
      select: {
        id: true,
        status: true,
        currentStep: true,
        updatedAt: true,
        unitId: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
    return { success: true, data: processes }
  } catch (error) {
    console.error('Error en getTenantProcessesAction:', error)
    return { success: false, error: 'No se pudieron obtener los procesos' }
  }
}

export const deleteTenantProcessAction = async (processId: string, tenantId: string) => {
  if (!processId) return { success: false, error: 'Falta processId' }
  if (!tenantId) return { success: false, error: 'Falta tenantId' }
  try {
    const existing = await prisma.process.findFirst({
      where: { id: processId, tenantId },
      select: { id: true },
    })
    if (!existing) return { success: false, error: 'Proceso no encontrado' }

    await prisma.process.delete({
      where: { id: processId },
    })

    return { success: true }
  } catch (error) {
    console.error('Error en deleteTenantProcessAction:', error)
    return { success: false, error: 'No se pudo eliminar el proceso' }
  }
}

export const getAdminProcessesAction = async (userId?: string) => {
  try {
    const processes = await prisma.process.findMany({
      where: {
        status: { in: [ProcessStatus.IN_PROGRESS, ProcessStatus.IN_EVALUATION, ProcessStatus.WAITING_FOR_FEEDBACK] },
      },
      select: {
        id: true,
        status: true,
        currentStep: true,
        updatedAt: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            user: { select: { name: true, lastName: true, email: true } },
          },
        },
        unit: {
          select: {
            id: true,
            unitNumber: true,
            property: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return { success: true, data: processes }
  } catch (error) {
    console.error('Error en getAdminProcessesAction:', error)
    return { success: false, error: 'No se pudieron obtener las aplicaciones' }
  }
}

export type AdminProcessList = NonNullable<Awaited<ReturnType<typeof getAdminProcessesAction>>['data']>
export type AdminProcess = AdminProcessList[number]
