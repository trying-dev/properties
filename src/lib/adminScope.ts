import type { Prisma } from '+/generated/prisma/client'
import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'

// SUPER_ADMIN accede a todas las propiedades; el resto solo a las que administra.
export const getAdminScope = async (userId: string) => {
  const admin = await prisma.admin.findFirst({
    where: { userId },
    select: { id: true, adminLevel: true },
  })
  if (!admin) return null

  return { adminId: admin.id, isSuperAdmin: admin.adminLevel === 'SUPER_ADMIN' }
}

export type AdminScope = NonNullable<Awaited<ReturnType<typeof getAdminScope>>>

export const getCurrentAdminScope = async () => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  return getAdminScope(userId)
}

export const propertyAccessFilter = (scope: AdminScope): Prisma.PropertyWhereInput =>
  scope.isSuperAdmin ? {} : { admins: { some: { id: scope.adminId } } }
