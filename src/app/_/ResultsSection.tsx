import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Grid3x3, List, Map as MapIcon, Search } from 'lucide-react'
import { useDispatch, useSelector } from '+/redux'
import { resetFilters, setViewMode, type HomeViewMode } from '+/redux/slices/home'
import PropertyCard from './PropertyCard'
import PropertyStack, { UnitRow } from './PropertyStack'
import { PropertiesMap, formatAddress, parseGpsCoordinates, type MapPropertyMarker } from '+/components/Map'
import { getTenantFavoriteUnitIdsAction, toggleTenantFavoriteUnitAction } from '+/actions/favorites'

const VIEW_STORAGE_KEY = 'home-view'
const VIEW_MODES: HomeViewMode[] = ['large', 'small', 'list', 'map']

type AvailabilityFilter = 'all' | 'VACANT' | 'PARTIAL'

function firstImageOf(images?: string | null): string | null {
  try {
    return (JSON.parse(images || '[]') as string[])[0] ?? null
  } catch {
    return null
  }
}

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

  // Marcadores del mapa: una propiedad por pin (respeta filtros y disponibilidad), con sus unidades como enlaces.
  const mapMarkers = useMemo<MapPropertyMarker[]>(() => {
    const markers: MapPropertyMarker[] = []
    for (const { property, units: propertyUnits } of groupedProperties) {
      const coords = parseGpsCoordinates(property.gpsCoordinates)
      if (!coords) continue
      const prices = propertyUnits.map((u) => u.baseRent).filter((v): v is number => typeof v === 'number' && v > 0)
      const minPrice = prices.length ? Math.min(...prices) : null
      let imageUrl: string | null = null
      for (const unit of propertyUnits) {
        try {
          const first = (JSON.parse(unit.images || '[]') as string[])[0]
          if (first) {
            imageUrl = first
            break
          }
        } catch {}
      }
      markers.push({
        id: property.id,
        name: property.name,
        address: formatAddress(property),
        lat: coords.lat,
        lng: coords.lng,
        imageUrl,
        subtitle: `${propertyUnits.length} disponible${propertyUnits.length === 1 ? '' : 's'}${
          minPrice ? ` · desde ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(minPrice)}` : ''
        }`,
        links: propertyUnits.map((u, i) => ({
          href: `/units/${u.id}`,
          label: `Unidad ${i + 1}`,
          imageUrl: firstImageOf(u.images),
          detail: u.baseRent
            ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(u.baseRent)
            : 'Consultar',
        })),
      })
    }
    return markers
  }, [groupedProperties])

  // Restaura la vista elegida antes; se hace tras hidratar para no desajustar el HTML del servidor.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY) as HomeViewMode | null
      if (stored && VIEW_MODES.includes(stored)) dispatch(setViewMode(stored))
    } catch {
      // La preferencia es opcional.
    }
  }, [dispatch])

  const changeViewMode = (mode: HomeViewMode) => {
    dispatch(setViewMode(mode))
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, mode)
    } catch {
      // La preferencia es opcional.
    }
  }

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

  const isMapView = viewMode === 'map'
  const isMosaic = viewMode === 'large' || viewMode === 'small'
  // En mosaico se listan unidades; en lista y mapa se agrupan por propiedad.
  const mosaicUnits = useMemo(() => groupedProperties.flatMap((entry) => entry.units), [groupedProperties])
  const resultCount = isMosaic ? mosaicUnits.length : groupedProperties.length
  const isEmpty = groupedProperties.length === 0

  const viewOptions = [
    { mode: 'large', label: 'Mosaico grande', Icon: LayoutGrid },
    { mode: 'small', label: 'Mosaico pequeño', Icon: Grid3x3 },
    { mode: 'list', label: 'Lista', Icon: List },
    { mode: 'map', label: 'Mapa', Icon: MapIcon },
  ] as const

  const renderUnitCard = (unit: (typeof mosaicUnits)[number], index: number, compact: boolean) => (
    <PropertyCard
      key={unit.id}
      unit={unit}
      index={index}
      compact={compact}
      isAuthenticated={isAuthenticated}
      role={role}
      isFavorite={favoriteUnitIds.includes(unit.id)}
      isFavoritesLoading={isLoadingFavorites}
      onToggleFavorite={handleToggleFavorite}
    />
  )

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{resultCount}</span> {isMosaic
            ? resultCount === 1
              ? 'unidad disponible'
              : 'unidades disponibles'
            : resultCount === 1
              ? 'propiedad disponible'
              : 'propiedades disponibles'}
        </p>

        <div className="flex items-center gap-3">
          <select
            value={availability}
            onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="all">Toda disponibilidad</option>
            <option value="VACANT">Totalmente disponible</option>
            <option value="PARTIAL">Parcialmente disponible</option>
          </select>

          <div className="inline-flex rounded-lg border border-gray-200 p-0.5">
            {viewOptions.map(({ mode, label, Icon }) => (
              <button
                key={mode}
                onClick={() => changeViewMode(mode)}
                aria-pressed={viewMode === mode}
                aria-label={label}
                title={label}
                className={`inline-flex items-center p-2 rounded-md transition-colors cursor-pointer ${
                  viewMode === mode ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isEmpty && isMapView && (
        <div className="space-y-3">
          {mapMarkers.length < groupedProperties.length && (
            <p className="text-sm text-gray-500">
              {groupedProperties.length - mapMarkers.length} propiedad(es) sin coordenadas no aparecen en el mapa.
            </p>
          )}
          <PropertiesMap markers={mapMarkers} />
        </div>
      )}

      {!isEmpty && viewMode === 'large' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mosaicUnits.map((unit, index) => renderUnitCard(unit, index, false))}
        </div>
      )}

      {!isEmpty && viewMode === 'small' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {mosaicUnits.map((unit, index) => renderUnitCard(unit, index, true))}
        </div>
      )}

      {!isEmpty && viewMode === 'list' && (
        <div className="rounded-2xl border border-gray-200 divide-y divide-gray-100">
          {groupedProperties.map(({ property, units: propertyUnits }) =>
            propertyUnits.length === 1 ? (
              <UnitRow key={property.id} property={property} unit={propertyUnits[0]} />
            ) : (
              <PropertyStack key={property.id} property={property} units={propertyUnits} variant="row" />
            ),
          )}
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
