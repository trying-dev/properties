import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useDispatch, useSelector } from '+/redux'
import { resetFilters } from '+/redux/slices/home'
import PropertyCard from './PropertyCard'
import { getTenantFavoriteUnitIdsAction, toggleTenantFavoriteUnitAction } from '+/actions/favorites'

export default function ResultsSection() {
  const dispatch = useDispatch()
  const { units, searchQuery, filters } = useSelector((state) => state.home)
  const reduxIsAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const reduxUser = useSelector((state) => state.user)
  const isAuthenticated = reduxIsAuthenticated
  const role = reduxUser?.role ?? null
  const [favoriteUnitIds, setFavoriteUnitIds] = useState<string[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        !searchQuery ||
        unit.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${unit.property.city} ${unit.property.neighborhood}`.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPrice = !filters.priceMax || (unit.baseRent ?? 0) <= Number(filters.priceMax)
      const matchesBedrooms = !filters.bedrooms || unit.bedrooms >= Number(filters.bedrooms)
      const matchesCity = !filters.city || unit.property.city.toLowerCase() === filters.city.toLowerCase()
      return matchesSearch && matchesPrice && matchesBedrooms && matchesCity
    })
  }, [units, searchQuery, filters])

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      if (!isAuthenticated || role !== 'tenant') {
        setFavoriteUnitIds([])
        return
      }
      setIsLoadingFavorites(true)
      const result = await getTenantFavoriteUnitIdsAction()
      if (isMounted && result.success) {
        setFavoriteUnitIds(result.data ?? [])
      }
      if (isMounted) {
        setIsLoadingFavorites(false)
      }
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
      setFavoriteUnitIds(result.data.favoriteUnitIds)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{filteredUnits.length}</span> propiedades disponibles
        </p>
        <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option>Más recientes</option>
          <option>Precio: menor a mayor</option>
          <option>Precio: mayor a menor</option>
          <option>Área: mayor a menor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.map((unit, index) => (
          <PropertyCard
            key={unit.id}
            unit={unit}
            index={index}
            isAuthenticated={isAuthenticated}
            role={role}
            isFavorite={favoriteUnitIds.includes(unit.id)}
            isFavoritesLoading={isLoadingFavorites}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      {filteredUnits.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron propiedades</h3>
          <p className="text-gray-600 mb-6">Intenta ajustar tus filtros de búsqueda</p>
          <button onClick={() => dispatch(resetFilters())} className="text-sm font-medium text-gray-900 hover:text-gray-700 underline">
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  )
}
