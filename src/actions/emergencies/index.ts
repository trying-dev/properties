'use server'

import { revalidatePath } from 'next/cache'
import { DrillScenario } from '+/generated/prisma/client'
import { prisma } from '+/lib/prisma'
import { getCurrentAdminScope, propertyAccessFilter } from '+/lib/adminScope'

const trimOrNull = (value?: string | null) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

const revalidateEmergencies = () => {
  revalidatePath('/dashboard/admin/emergencies')
  revalidatePath('/dashboard/tenant/cases')
}

export const getAdminEmergencyDataAction = async () => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const [properties, drills, routes] = await Promise.all([
      prisma.property.findMany({ where: propertyAccessFilter(scope), orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      prisma.drillRecord.findMany({
        where: { property: propertyAccessFilter(scope) },
        orderBy: { heldAt: 'desc' },
        take: 100,
        select: {
          id: true,
          scenario: true,
          heldAt: true,
          participants: true,
          durationMinutes: true,
          evaluation: true,
          improvements: true,
          property: { select: { name: true } },
        },
      }),
      prisma.evacuationRoute.findMany({
        where: { property: propertyAccessFilter(scope) },
        orderBy: [{ property: { name: 'asc' } }, { name: 'asc' }],
        select: { id: true, name: true, steps: true, meetingPoint: true, planUrl: true, active: true, property: { select: { name: true } } },
      }),
    ])

    return { success: true, data: { properties, drills, routes } }
  } catch (error) {
    console.error('Error en getAdminEmergencyDataAction:', error)
    return { success: false, error: 'No se pudo cargar la información de emergencias' }
  }
}

export type AdminEmergencyData = NonNullable<Awaited<ReturnType<typeof getAdminEmergencyDataAction>>['data']>

export const registerDrillAction = async (input: {
  propertyId: string
  scenario: DrillScenario
  heldAt: string
  participants: number
  durationMinutes?: number | null
  evaluation?: string | null
  improvements?: string | null
}) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }
    if (!Object.values(DrillScenario).includes(input.scenario)) return { success: false, error: 'Escenario inválido' }

    const heldAt = new Date(`${input.heldAt}T12:00:00`)
    if (Number.isNaN(heldAt.getTime())) return { success: false, error: 'Fecha inválida' }
    const participants = Math.trunc(input.participants)
    if (!Number.isFinite(participants) || participants < 0) return { success: false, error: 'Participantes inválidos' }

    const property = await prisma.property.findFirst({ where: { id: input.propertyId, ...propertyAccessFilter(scope) }, select: { id: true } })
    if (!property) return { success: false, error: 'Propiedad no encontrada' }

    await prisma.drillRecord.create({
      data: {
        propertyId: property.id,
        scenario: input.scenario,
        heldAt,
        participants,
        durationMinutes: input.durationMinutes ? Math.trunc(input.durationMinutes) : null,
        evaluation: trimOrNull(input.evaluation),
        improvements: trimOrNull(input.improvements),
        createdById: scope.adminId,
      },
    })

    revalidateEmergencies()
    return { success: true }
  } catch (error) {
    console.error('Error en registerDrillAction:', error)
    return { success: false, error: 'No se pudo registrar el simulacro' }
  }
}

export const saveEvacuationRouteAction = async (input: {
  propertyId: string
  name: string
  steps: string
  meetingPoint?: string | null
  planUrl?: string | null
}) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const name = trimOrNull(input.name)
    const steps = trimOrNull(input.steps)
    if (!name || !steps) return { success: false, error: 'Completa el nombre y el recorrido' }

    const planUrl = trimOrNull(input.planUrl)
    if (planUrl && !/^https?:\/\//i.test(planUrl)) return { success: false, error: 'La imagen del plano debe ser un enlace http o https' }

    const property = await prisma.property.findFirst({ where: { id: input.propertyId, ...propertyAccessFilter(scope) }, select: { id: true } })
    if (!property) return { success: false, error: 'Propiedad no encontrada' }

    await prisma.evacuationRoute.create({
      data: { propertyId: property.id, name, steps, meetingPoint: trimOrNull(input.meetingPoint), planUrl },
    })

    revalidateEmergencies()
    return { success: true }
  } catch (error) {
    console.error('Error en saveEvacuationRouteAction:', error)
    return { success: false, error: 'No se pudo guardar la ruta' }
  }
}

export const setEvacuationRouteActiveAction = async ({ routeId, active }: { routeId: string; active: boolean }) => {
  try {
    const scope = await getCurrentAdminScope()
    if (!scope) return { success: false, error: 'Solo administradores' }

    const route = await prisma.evacuationRoute.findFirst({ where: { id: routeId, property: propertyAccessFilter(scope) }, select: { id: true } })
    if (!route) return { success: false, error: 'Ruta no encontrada' }

    await prisma.evacuationRoute.update({ where: { id: route.id }, data: { active } })
    revalidateEmergencies()
    return { success: true }
  } catch (error) {
    console.error('Error en setEvacuationRouteActiveAction:', error)
    return { success: false, error: 'No se pudo actualizar la ruta' }
  }
}
