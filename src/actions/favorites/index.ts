'use server'

import { auth } from '+/lib/auth'
import { prisma } from '+/lib/prisma'

const normalizeFavoriteIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

const getTenantBySession = async () => {
  const session = await auth()
  if (!session?.user.id) return null
  return prisma.tenant.findUnique({
    where: { userId: session.user.id },
    select: { id: true, favoriteUnitIds: true },
  })
}

export const getTenantFavoriteUnitIdsAction = async () => {
  try {
    const tenant = await getTenantBySession()
    if (!tenant) return { success: true, data: [] as string[] }
    const favoriteUnitIds = normalizeFavoriteIds(tenant.favoriteUnitIds)
    return { success: true, data: favoriteUnitIds }
  } catch (error) {
    console.error('Error en getTenantFavoriteUnitIdsAction:', error)
    return { success: false, error: 'No se pudieron cargar los favoritos' }
  }
}

export const toggleTenantFavoriteUnitAction = async (unitId: string) => {
  const normalizedUnitId = unitId?.trim()
  if (!normalizedUnitId) return { success: false, error: 'Falta unitId' }

  try {
    const tenant = await getTenantBySession()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }

    const currentFavorites = normalizeFavoriteIds(tenant.favoriteUnitIds)
    const isFavorite = currentFavorites.includes(normalizedUnitId)
    const nextFavorites = isFavorite
      ? currentFavorites.filter((id) => id !== normalizedUnitId)
      : [...currentFavorites, normalizedUnitId]

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { favoriteUnitIds: nextFavorites },
      select: { id: true },
    })

    return { success: true, data: { favoriteUnitIds: nextFavorites, isFavorite: !isFavorite } }
  } catch (error) {
    console.error('Error en toggleTenantFavoriteUnitAction:', error)
    return { success: false, error: 'No se pudo actualizar el favorito' }
  }
}

export const getTenantFavoriteUnitsAction = async () => {
  try {
    const tenant = await getTenantBySession()
    if (!tenant) return { success: false, error: 'Usuario no autenticado' }
    const favoriteUnitIds = normalizeFavoriteIds(tenant.favoriteUnitIds)
    if (favoriteUnitIds.length === 0) {
      return { success: true, data: [] }
    }

    const units = await prisma.unit.findMany({
      where: { id: { in: favoriteUnitIds } },
      include: {
        property: {
          include: {
            admins: { include: { user: true } },
          },
        },
      },
    })

    const unitMap = new Map(units.map((unit) => [unit.id, unit]))
    const orderedUnits = favoriteUnitIds
      .map((id) => unitMap.get(id))
      .filter((unit): unit is (typeof units)[number] => Boolean(unit))

    return { success: true, data: orderedUnits }
  } catch (error) {
    console.error('Error en getTenantFavoriteUnitsAction:', error)
    return { success: false, error: 'No se pudieron cargar las unidades favoritas' }
  }
}
