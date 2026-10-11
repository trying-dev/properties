'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Grid3x3, LayoutGrid, Map as MapIcon, Rows3 } from 'lucide-react'
import { UnitStatus } from '+/generated/prisma/enums'
import type { Property } from '+/generated/prisma/client'

import FilterSelect from '+/components/FilterSelect'
import Header from '+/components/Header'
import ViewModeToggle from '+/components/ViewModeToggle'
import { PropertiesMap, formatAddress, parseGpsCoordinates, type MapPropertyMarker } from '+/components/Map'
import { parseImages } from '+/app/units/[id]/_/utils'
import { getAdminUnitsAction } from '+/actions/units'
import { getProperties } from '+/actions/property'
import type { AdminUnitRow } from '+/actions/units'
import { UnitCompactCard, UnitListRow, UnitMosaicCard, unitStatusLabel as statusLabel } from './_/UnitViews'

type ViewMode = 'list' | 'mosaic' | 'compact' | 'map'

const VIEW_STORAGE_KEY = 'units-view'

const readStoredView = (): ViewMode => {
  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY)
    return stored === 'mosaic' || stored === 'compact' || stored === 'map' ? stored : 'list'
  } catch {
    return 'list'
  }
}

export default function AdminUnitsPage() {
  const [view, setView] = useState<ViewMode>('list')
  const [units, setUnits] = useState<AdminUnitRow[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [status, setStatus] = useState<UnitStatus | ''>('')
  const [propertyId, setPropertyId] = useState('')
  const [city, setCity] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 50

  const cities = useMemo(() => {
    const values = new Set<string>()
    properties.forEach((property) => {
      if (property.city) values.add(property.city)
    })
    return Array.from(values).sort()
  }, [properties])

  // Un pin por propiedad con sus unidades (según los filtros activos) como enlaces.
  const { mapMarkers, unmappedCount } = useMemo(() => {
    const byProperty = new Map<string, MapPropertyMarker>()
    let unmapped = 0
    for (const unit of units) {
      const coords = parseGpsCoordinates(unit.property.gpsCoordinates)
      if (!coords) {
        unmapped += 1
        continue
      }
      const existing = byProperty.get(unit.propertyId)
      const link = {
        href: `/dashboard/admin/units/${unit.id}`,
        label: `Unidad ${unit.unitNumber}`,
        imageUrl: parseImages(unit.images)[0] ?? null,
        detail: unit.baseRent ? `$ ${unit.baseRent.toLocaleString('es-CO')}` : statusLabel[unit.status],
      }
      if (existing) {
        existing.links = [...(existing.links ?? []), link]
        continue
      }
      byProperty.set(unit.propertyId, {
        id: unit.propertyId,
        name: unit.property.name,
        address: formatAddress(unit.property),
        lat: coords.lat,
        lng: coords.lng,
        imageUrl: parseImages(unit.images)[0] ?? parseImages(unit.property.images)[0] ?? null,
        links: [link],
      })
    }
    const markers = [...byProperty.values()].map((marker) => ({
      ...marker,
      subtitle: `${marker.links?.length ?? 0} unidad${marker.links?.length === 1 ? '' : 'es'}`,
    }))
    return { mapMarkers: markers, unmappedCount: unmapped }
  }, [units])

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await getProperties()
        setProperties(data)
      } catch (err) {
        console.error('Error loading properties:', err)
      }
    }
    loadProperties()
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada, solo disponible en el cliente
    setView(readStoredView())
  }, [])

  const changeView = (next: ViewMode) => {
    setView(next)
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, next)
    } catch {
      // La preferencia es opcional; si el almacenamiento no está disponible se ignora.
    }
  }

  const loadUnits = async (filters?: { status?: UnitStatus; propertyId?: string; city?: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getAdminUnitsAction(filters)
      if (!result.success || !result.data) {
        setError(result.error ?? 'No se pudieron cargar las unidades')
        setUnits([])
        return
      }
      setUnits(result.data)
    } catch (err) {
      console.error('Error loading units:', err)
      setError('No se pudieron cargar las unidades')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const filters = {
      status: status || undefined,
      propertyId: propertyId || undefined,
      city: city || undefined,
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch de datos al cambiar filtros; el setState de loading es intencional
    void loadUnits(filters)
  }, [status, propertyId, city])

  // Al cambiar cualquier filtro, volver a la primera página
  const handleStatusChange = (value: UnitStatus | '') => {
    setStatus(value)
    setPage(1)
  }
  const handlePropertyChange = (value: string) => {
    setPropertyId(value)
    setPage(1)
  }
  const handleCityChange = (value: string) => {
    setCity(value)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(units.length / pageSize))
  const clampedPage = Math.min(page, totalPages)
  const startIndex = (clampedPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const pagedUnits = units.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unidades</h1>
            <p className="text-gray-600">Listado completo de unidades y sus contratos.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-gray-900 text-white text-sm font-semibold px-3 py-1 rounded-full">{units.length}</span>
            <ViewModeToggle
              value={view}
              onChange={changeView}
              options={[
                { mode: 'list', label: 'Listado', Icon: Rows3 },
                { mode: 'mosaic', label: 'Mosaico', Icon: LayoutGrid },
                { mode: 'compact', label: 'Mosaico pequeño', Icon: Grid3x3 },
                { mode: 'map', label: 'Mapa', Icon: MapIcon },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <FilterSelect label="Estado" value={status} onChange={(e) => handleStatusChange(e.target.value as UnitStatus | '')}>
            <option value="">Todos</option>
            {Object.values(UnitStatus).map((value) => (
              <option key={value} value={value}>
                {statusLabel[value]}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Propiedad" value={propertyId} onChange={(e) => handlePropertyChange(e.target.value)}>
            <option value="">Todas</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Ciudad" value={city} onChange={(e) => handleCityChange(e.target.value)}>
            <option value="">Todas</option>
            {cities.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </FilterSelect>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando unidades...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No hay unidades para los filtros seleccionados.</div>
        ) : (
          <>
            {view === 'map' && (
              <div className="space-y-3">
                {unmappedCount > 0 && (
                  <p className="text-sm text-gray-500">{unmappedCount} unidad(es) sin coordenadas en su propiedad no aparecen en el mapa.</p>
                )}
                <PropertiesMap markers={mapMarkers} />
              </div>
            )}
            {view === 'list' && (
              <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200 overflow-hidden">
                {pagedUnits.map((unit) => (
                  <UnitListRow key={unit.id} unit={unit} />
                ))}
              </div>
            )}
            {view === 'mosaic' && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pagedUnits.map((unit) => (
                  <UnitMosaicCard key={unit.id} unit={unit} />
                ))}
              </div>
            )}
            {view === 'compact' && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {pagedUnits.map((unit) => (
                  <UnitCompactCard key={unit.id} unit={unit} />
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && !error && units.length > pageSize && (
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Mostrando {startIndex + 1}-{Math.min(endIndex, units.length)} de {units.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={clampedPage === 1}
              >
                Anterior
              </button>
              <span className="px-2">
                {clampedPage} / {totalPages}
              </span>
              <button
                type="button"
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={clampedPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
