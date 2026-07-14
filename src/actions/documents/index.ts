'use server'

import { revalidatePath } from 'next/cache'
import { Prisma, PropertyDocumentType } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'

const docInclude = {
  property: { select: { id: true, name: true } },
  unit: { select: { id: true, unitNumber: true } },
} satisfies Prisma.PropertyDocumentInclude

export type PropertyDocumentRow = Prisma.PropertyDocumentGetPayload<{ include: typeof docInclude }>

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

export const getAdminDocuments = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  return prisma.propertyDocument.findMany({
    where: { property: { admins: { some: { id: admin.id } } } },
    include: docInclude,
    orderBy: [{ property: { name: 'asc' } }, { createdAt: 'desc' }],
  })
}

export type AdminDocumentRow = Awaited<ReturnType<typeof getAdminDocuments>>[0]

export const createDocumentAction = async (input: {
  propertyId: string
  type: PropertyDocumentType
  name: string
  unitId?: string
  fileUrl?: string
  issuedDate?: string
  expiryDate?: string
}) => {
  const guard = await requireAdminForProperty(input.propertyId)
  if ('error' in guard) return { success: false, error: guard.error }

  if (!input.name?.trim()) return { success: false, error: 'El nombre es obligatorio' }

  if (input.unitId) {
    const unit = await prisma.unit.findFirst({
      where: { id: input.unitId, propertyId: input.propertyId },
      select: { id: true },
    })
    if (!unit) return { success: false, error: 'La unidad no pertenece a la propiedad' }
  }

  try {
    const doc = await prisma.propertyDocument.create({
      data: {
        propertyId: input.propertyId,
        unitId: input.unitId || null,
        type: input.type,
        name: input.name.trim(),
        fileUrl: input.fileUrl?.trim() || null,
        issuedDate: input.issuedDate ? new Date(input.issuedDate) : null,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
      },
      include: docInclude,
    })

    revalidatePath('/dashboard/admin/documents')
    return { success: true, data: doc }
  } catch (error) {
    console.error('Error creating document:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al crear documento' }
  }
}

export const deleteDocumentAction = async (input: { documentId: string }) => {
  try {
    const doc = await prisma.propertyDocument.findUnique({ where: { id: input.documentId }, select: { propertyId: true } })
    if (!doc) return { success: false, error: 'Documento no encontrado' }

    const guard = await requireAdminForProperty(doc.propertyId)
    if ('error' in guard) return { success: false, error: guard.error }

    await prisma.propertyDocument.delete({ where: { id: input.documentId } })

    revalidatePath('/dashboard/admin/documents')
    return { success: true }
  } catch (error) {
    console.error('Error deleting document:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error al eliminar documento' }
  }
}
