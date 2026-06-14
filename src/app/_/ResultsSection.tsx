import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Building2, Search } from 'lucide-react'
import { useDispatch, useSelector } from '+/redux'
import { resetFilters, setViewMode } from '+/redux/slices/home'
import PropertyCard from './PropertyCard'
import PropertyGroup from './PropertyGroup'
import { getTenantFavoriteUnitIdsAction, toggleTenantFavoriteUnitAction } from '+/actions/favorites'

type AvailabilityFilter = 'all' | 'VACANT' | 'PARTIAL'

export default function ResultsSection() {
  const dispatch = useDispatch()
  const { units, properties, searchQuery, filters, viewMode } = useSelector((state) => state.home)
  const reduxIsAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const reduxUser = useSelector((state) => state.user)
  const isAuthenticated = reduxIsAuthenticated
  const role = reduxUser?.role ?? null
  const [favoriteUnitIds, setFavoriteUnitIds] = useState<string[]>([])
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')

  const filteredUnits = useMemo(() => {
    return (units || []).filter((unit) => {
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

  // Agrupa las unidades filtradas por propiedad y cruza con la ocupación derivada.
  const groupedProperties = useMemo(() => {
    const unitsByProperty = new Map<string, typeof filteredUnits>()
    for (const unit of filteredUnits) {
      const list = unitsByProperty.get(unit.property.id) ?? []
      list.push(unit)
      unitsByProperty.set(unit.property.id, list)
    }
    return (properties || [])
      .filter((property) => unitsByProperty.has(property.id))
      .filter((property) => availability === 'all' || property.occupancyStatus === availability)
      .map((property) => ({ property, units: unitsByProperty.get(property.id) ?? [] }))
  }, [filteredUnits, properties, availability])

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

  const isPropertiesView = viewMode === 'properties'
  const resultCount = isPropertiesView ? groupedProperties.length : filteredUnits.length
  const resultLabel = isPropertiesView ? 'propiedades' : 'unidades'
  const isEmpty = resultCount === 0

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{resultCount}</span> {resultLabel} disponibles
        </p>

        <div className="flex items-center gap-3">
          {isPropertiesView && (
            <select
              value={availability}
              onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="all">Toda disponibilidad</option>
              <option value="VACANT">Totalmente disponible</option>
              <option value="PARTIAL">Parcialmente disponible</option>
            </select>
          )}

          <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={() => dispatch(setViewMode('units'))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                !isPropertiesView ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Unidades
            </button>
            <button
              onClick={() => dispatch(setViewMode('properties'))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isPropertiesView ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Propiedades
            </button>
          </div>
        </div>
      </div>

      {!isEmpty && isPropertiesView && (
        <div className="space-y-6">
          {groupedProperties.map(({ property, units: groupUnits }) => (
            <PropertyGroup key={property.id} property={property} units={groupUnits} />
          ))}
        </div>
      )}

      {!isEmpty && !isPropertiesView && (
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
      )}

      {isEmpty && (
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
