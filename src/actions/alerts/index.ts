'use server'

import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'
import { scanExpirations, type ExpirationItem } from '+/lib/alerts/expirations'

export type { ExpirationItem } from '+/lib/alerts/expirations'

// Vencimientos próximos de las propiedades que gestiona el admin autenticado.
// Derivado (no escribe notificaciones; eso lo hace el cron).
export const getUpcomingExpirations = async (windowDays = 30): Promise<ExpirationItem[]> => {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return []

  const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
  if (!admin) return []

  const all = await scanExpirations(new Date(), windowDays)
  return all.filter((item) => item.adminIds.includes(admin.id))
}
