'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Heart } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import PropertyCard from '+/app/_/PropertyCard'
import { useSession } from '+/hooks/useSession'
import { getTenantFavoriteUnitIdsAction, getTenantFavoriteUnitsAction, toggleTenantFavoriteUnitAction } from '+/actions/favorites'

type FavoriteUnit = NonNullable<Awaited<ReturnType<typeof getTenantFavoriteUnitsAction>>['data']>[number]
type SafeFavoriteUnit = Exclude<FavoriteUnit, undefined>

export default function TenantFavoritesPage() {
  const router = useRouter()
  const { isAuthenticated, role, isLoading } = useSession()
  const [favorites, setFavorites] = useState<SafeFavoriteUnit[]>([])
  const [favoriteUnitIds, setFavoriteUnitIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      if (!isAuthenticated || role !== 'tenant') {
        if (isMounted) {
          setFavorites([])
          setFavoriteUnitIds([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)
      const [unitsResult, idsResult] = await Promise.all([getTenantFavoriteUnitsAction(), getTenantFavoriteUnitIdsAction()])
      if (!isMounted) return

      if (unitsResult.success && unitsResult.data) {
        setFavorites(unitsResult.data.filter((unit): unit is SafeFavoriteUnit => Boolean(unit)))
      } else {
        setFavorites([])
        setError(unitsResult.error ?? 'No se pudieron cargar los favoritos')
      }

      if (idsResult.success && idsResult.data) {
        setFavoriteUnitIds(idsResult.data)
      } else {
        setFavoriteUnitIds([])
      }

      setLoading(false)
    }

    void loadFavorites()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, role])

  const handleToggleFavorite = async (unitId: string) => {
    if (!isAuthenticated || role !== 'tenant') return
    const result = await toggleTenantFavoriteUnitAction(unitId)
    if (result.success && result.data) {
      const nextIds = result.data.favoriteUnitIds
      setFavoriteUnitIds(nextIds)
      setFavorites((prev) => prev.filter((unit) => nextIds.includes(unit.id)))
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-8 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard/tenant')} className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Favoritos</h1>
        </div>

        {loading || isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando favoritos...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center text-red-700">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Heart className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes favoritos</h2>
            <p className="text-gray-600 mb-6">Explora unidades y guarda las que más te gusten.</p>
            <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-white font-semibold hover:bg-blue-700 transition">
              Explorar unidades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((unit, index) => (
              <PropertyCard
                key={unit.id}
                unit={unit}
                index={index}
                isAuthenticated={isAuthenticated}
                role={role}
                isFavorite={favoriteUnitIds.includes(unit.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
