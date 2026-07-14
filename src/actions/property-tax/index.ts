'use server'

import { revalidatePath } from 'next/cache'
import { Prisma, TaxStatus } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

const taxInclude = {
  property: { select: { id: true, name: true } },
} satisfies Prisma.PropertyTaxInclude

export type PropertyTaxRow = Prisma.PropertyTaxGetPayload<{ include: typeof taxInclude }>

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

// Propiedades que gestiona el admin (para el selector del formulario).
export const getAdminPropertiesForSelect = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.property.findMany({
    where: { admins: { some: { id: admin.id } } },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

export const getAdminPropertyTaxes = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.propertyTax.findMany({
    where: { property: { admins: { some: { id: admin.id } } } },
    include: taxInclude,
    orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
  })
}

export type AdminPropertyTaxRow = Awaited<ReturnType<typeof getAdminPropertyTaxes>>[0]

export const getPropertyTaxes = async (propertyId: string) =>
  prisma.propertyTax.findMany({
    where: { propertyId },
    orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
  })

export const createPropertyTaxAction = async (input: {
  propertyId: string
  year: number
  amount: number
  dueDate?: string
  reference?: string
}) => {
  const guard = await requireAdminForProperty(input.propertyId)
  if ('error' in guard) return { success: false, error: guard.error }

  if (!Number.isInteger(input.year) || input.year < 2000) return { success: false, error: 'Año inválido' }
  if (!(input.amount > 0)) return { success: false, error: 'El valor debe ser mayor a 0' }

  try {
    const tax = await prisma.propertyTax.create({
      data: {
        propertyId: input.propertyId,
        year: input.year,
        amount: input.amount,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        reference: input.reference?.trim() || null,
      },
      include: taxInclude,
    })

    revalidatePath('/dashboard/admin/property-tax')
    return { success: true, data: tax }
  } catch (error) {
    console.error('Error creating property tax:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear predial' }
  }
}

// Marca el predial como PAID, fija paidDate (imputa el descuento a ese mes de liquidación).
export const markTaxPaidAction = async (input: { taxId: string; paidDate?: string; reference?: string }) => {
  try {
    const existing = await prisma.propertyTax.findUnique({
      where: { id: input.taxId },
      select: { propertyId: true },
    })
    if (!existing) return { success: false, error: 'Predial no encontrado' }

    const guard = await requireAdminForProperty(existing.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    const data: Prisma.PropertyTaxUpdateInput = {
      status: TaxStatus.PAID,
      paidDate: input.paidDate ? new Date(input.paidDate) : new Date(),
    }
    if (input.reference?.trim()) data.reference = input.reference.trim()

    const tax = await prisma.propertyTax.update({
      where: { id: input.taxId },
      data,
      include: taxInclude,
    })

    revalidatePath('/dashboard/admin/property-tax')
    revalidatePath('/dashboard/admin/payouts') // el predial OWNER afecta la liquidación
    return { success: true, data: tax }
  } catch (error) {
    console.error('Error marking tax paid:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al marcar pagado' }
  }
}

export const deletePropertyTaxAction = async (input: { taxId: string }) => {
  try {
    const existing = await prisma.propertyTax.findUnique({
      where: { id: input.taxId },
      select: { propertyId: true },
    })
    if (!existing) return { success: false, error: 'Predial no encontrado' }

    const guard = await requireAdminForProperty(existing.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    await prisma.propertyTax.delete({ where: { id: input.taxId } })

    revalidatePath('/dashboard/admin/property-tax')
    revalidatePath('/dashboard/admin/payouts')
    return { success: true }
  } catch (error) {
    console.error('Error deleting property tax:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar predial' }
  }
}
