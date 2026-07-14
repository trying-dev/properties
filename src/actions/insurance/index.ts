'use server'

import { revalidatePath } from 'next/cache'
import { PolicyStatus, Prisma } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

const policyInclude = {
  property: { select: { id: true, name: true } },
} satisfies Prisma.InsurancePolicyInclude

export type InsurancePolicyRow = Prisma.InsurancePolicyGetPayload<{ include: typeof policyInclude }>

// Admin autenticado que gestiona la propiedad. Devuelve userId o error.
const requireAdminForProperty = async (propertyId: string) => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'No autenticado' as const }

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return { error: 'No autorizado' as const }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, admins: { some: { id: admin.id } } },
    select: { id: true },
  })
  if (!property) return { error: 'Propiedad no encontrada' as const }

  return { userId }
}

export const getAdminPolicies = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.insurancePolicy.findMany({
    where: { property: { admins: { some: { id: admin.id } } } },
    include: policyInclude,
    orderBy: [{ endDate: 'asc' }, { createdAt: 'desc' }],
  })
}

export type AdminPolicyRow = Awaited<ReturnType<typeof getAdminPolicies>>[0]

export const createInsurancePolicyAction = async (input: {
  propertyId: string
  insurer: string
  policyNumber: string
  startDate: string
  endDate: string
  coverage?: string
  amount?: number
  premium?: number
}) => {
  const guard = await requireAdminForProperty(input.propertyId)
  if ('error' in guard) return { success: false, error: guard.error }

  if (!input.insurer?.trim()) return { success: false, error: 'La aseguradora es obligatoria' }
  if (!input.policyNumber?.trim()) return { success: false, error: 'El número de póliza es obligatorio' }
  if (!input.startDate || !input.endDate) return { success: false, error: 'Fechas de vigencia obligatorias' }
  if (new Date(input.endDate) <= new Date(input.startDate)) {
    return { success: false, error: 'El fin de vigencia debe ser posterior al inicio' }
  }

  try {
    const policy = await prisma.insurancePolicy.create({
      data: {
        propertyId: input.propertyId,
        insurer: input.insurer.trim(),
        policyNumber: input.policyNumber.trim(),
        coverage: input.coverage?.trim() || null,
        amount: input.amount ?? null,
        premium: input.premium ?? null,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      },
      include: policyInclude,
    })

    revalidatePath('/dashboard/admin/insurance')
    return { success: true, data: policy }
  } catch (error) {
    console.error('Error creating policy:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear póliza' }
  }
}

export const updatePolicyStatusAction = async (input: { policyId: string; status: PolicyStatus }) => {
  try {
    const existing = await prisma.insurancePolicy.findUnique({
      where: { id: input.policyId },
      select: { propertyId: true },
    })
    if (!existing) return { success: false, error: 'Póliza no encontrada' }

    const guard = await requireAdminForProperty(existing.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    const policy = await prisma.insurancePolicy.update({
      where: { id: input.policyId },
      data: { status: input.status },
      include: policyInclude,
    })

    revalidatePath('/dashboard/admin/insurance')
    return { success: true, data: policy }
  } catch (error) {
    console.error('Error updating policy status:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al actualizar póliza' }
  }
}

export const deleteInsurancePolicyAction = async (input: { policyId: string }) => {
  try {
    const existing = await prisma.insurancePolicy.findUnique({
      where: { id: input.policyId },
      select: { propertyId: true },
    })
    if (!existing) return { success: false, error: 'Póliza no encontrada' }

    const guard = await requireAdminForProperty(existing.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    await prisma.insurancePolicy.delete({ where: { id: input.policyId } })

    revalidatePath('/dashboard/admin/insurance')
    return { success: true }
  } catch (error) {
    console.error('Error deleting policy:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar póliza' }
  }
}
