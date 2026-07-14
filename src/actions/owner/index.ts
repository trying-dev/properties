'use server'

import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'

// Datos del dueño autenticado: sus propiedades (con participación) y sus liquidaciones.
export const getOwnerDashboard = async () => {
  const session = await auth()
  if (!session?.user.id) return null

  return prisma.owner.findUnique({
    where: { userId: session.user.id },
    include: {
      properties: {
        where: { active: true },
        include: {
          property: {
            include: {
              units: {
                select: { id: true, unitNumber: true, status: true },
              },
            },
          },
        },
      },
      payouts: {
        orderBy: [{ period: 'desc' }, { createdAt: 'desc' }],
      },
    },
  })
}

export type OwnerDashboard = NonNullable<Awaited<ReturnType<typeof getOwnerDashboard>>>
