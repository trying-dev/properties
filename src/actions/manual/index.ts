'use server'

import { headers } from 'next/headers'
import { prisma } from '+/lib/prisma'
import { auth } from '+/lib/auth'
import { MANUAL_CODE, MANUAL_VERSION } from '+/lib/manual'

export const getManualAcceptanceAction = async () => {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: true, data: { authenticated: false, accepted: false, acceptedAt: null as Date | null } }

    const acceptance = await prisma.manualAcceptance.findUnique({
      where: { userId_manualCode_manualVersion: { userId, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION } },
      select: { acceptedAt: true },
    })
    return { success: true, data: { authenticated: true, accepted: !!acceptance, acceptedAt: acceptance?.acceptedAt ?? null } }
  } catch (error) {
    console.error('Error en getManualAcceptanceAction:', error)
    return { success: false, error: 'No se pudo consultar la aceptación del manual' }
  }
}

export const acceptManualAction = async () => {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: 'Debes iniciar sesión para aceptar el manual' }

    const h = await headers()
    const ipAddress = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? null
    const userAgent = h.get('user-agent')

    // Idempotente: si ya aceptó esta versión se conserva la fecha original.
    const acceptance = await prisma.manualAcceptance.upsert({
      where: { userId_manualCode_manualVersion: { userId, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION } },
      create: { userId, manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION, ipAddress, userAgent },
      update: {},
      select: { acceptedAt: true },
    })
    return { success: true, data: { acceptedAt: acceptance.acceptedAt } }
  } catch (error) {
    console.error('Error en acceptManualAction:', error)
    return { success: false, error: 'No se pudo registrar la aceptación' }
  }
}

// Admin: quién aceptó la versión vigente y quién no (solo inquilinos activos).
export const getManualAcceptanceReportAction = async () => {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) return { success: false, error: 'No autenticado' }
    const admin = await prisma.admin.findFirst({ where: { userId }, select: { id: true } })
    if (!admin) return { success: false, error: 'No autorizado' }

    const tenants = await prisma.tenant.findMany({
      where: { user: { disable: false, deletedAt: null } },
      select: {
        id: true,
        user: {
          select: {
            name: true,
            lastName: true,
            email: true,
            manualAcceptances: {
              where: { manualCode: MANUAL_CODE, manualVersion: MANUAL_VERSION },
              select: { acceptedAt: true },
            },
          },
        },
      },
      orderBy: { user: { name: 'asc' } },
    })

    const rows = tenants.map((t) => ({
      tenantId: t.id,
      name: `${t.user.name} ${t.user.lastName}`.trim(),
      email: t.user.email,
      acceptedAt: t.user.manualAcceptances[0]?.acceptedAt ?? null,
    }))
    return { success: true, data: { version: MANUAL_VERSION, rows } }
  } catch (error) {
    console.error('Error en getManualAcceptanceReportAction:', error)
    return { success: false, error: 'No se pudo cargar el reporte' }
  }
}
