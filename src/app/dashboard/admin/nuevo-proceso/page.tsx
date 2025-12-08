'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { Search, Home, MapPin, Bed, Bath, Check, X } from 'lucide-react'
import {
  AvailableUnit,
  PropertyWithAvailableUnits,
} from '+/actions/nuevo-proceso/actions_and_mutations'
import {
  getAvailableUnitsAction,
  getPropertiesWithAvailableUnitsAction,
} from '+/actions/nuevo-proceso/actions_and_mutations'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PriceRangeSliderProps {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
  className?: string
  priceDistribution: number[] // Array de conteos por rango de precios
  distributionStep: number
}

const PriceRangeSlider = ({
  min,
  max,
  step = 50000,
  value,
  onChange,
  formatValue = (val) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val),
  className = '',
  priceDistribution,
  distributionStep,
}: PriceRangeSliderProps) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const getPercentage = useCallback(
    (val: number) => {
      return ((val - min) / (max - min)) * 100
    },
    [min, max]
  )

  const getValueFromPercentage = useCallback(
    (percentage: number) => {
      const rawValue = min + (percentage / 100) * (max - min)
      return Math.round(rawValue / step) * step
    },
    [min, max, step]
  )

  const handleMouseDown = (handle: 'min' | 'max') => (e: ReactMouseEvent) => {
    e.preventDefault()
    setIsDragging(handle)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const newValue = getValueFromPercentage(percentage)

      if (isDragging === 'min') {
        const newMin = Math.min(newValue, value[1] - step)
        if (newMin >= min) {
          onChange([newMin, value[1]])
        }
      } else {
        const newMax = Math.max(newValue, value[0] + step)
        if (newMax <= max) {
          onChange([value[0], newMax])
        }
      }
    },
    [isDragging, value, onChange, getValueFromPercentage, step, min, max]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleTrackClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isDragging) return

    const rect = sliderRef.current!.getBoundingClientRect()
    const percentage = ((e.clientX - rect.left) / rect.width) * 100
    const newValue = getValueFromPercentage(percentage)

    // Determinar cuál handle está más cerca
    const distanceToMin = Math.abs(newValue - value[0])
    const distanceToMax = Math.abs(newValue - value[1])

    if (distanceToMin <= distanceToMax) {
      const newMin = Math.min(newValue, value[1] - step)
      if (newMin >= min) {
        onChange([newMin, value[1]])
      }
    } else {
      const newMax = Math.max(newValue, value[0] + step)
      if (newMax <= max) {
        onChange([value[0], newMax])
      }
    }
  }

  const minPercentage = getPercentage(value[0])
  const maxPercentage = getPercentage(value[1])

  // Calcular la altura máxima para normalizar las barras
  const maxCount = Math.max(...priceDistribution, 1)

  const bucketStartToAtLeast = (min: number, max: number, step: number, start: number) =>
    Math.min(max, Math.max(start + step, start + step)) // mantiene al menos 1 step

  return (
    <div className={`w-full ${className}`}>
      {/* Valores actuales */}
      <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>

      {/* Histograma de distribución */}
      <div className="relative mb-2">
        <div className="flex items-end h-8 space-x-px">
          {priceDistribution.map((count, index) => {
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0
            const rangeStart = min + index * distributionStep
            const rangeEnd = Math.min(min + (index + 1) * distributionStep, max)
            const isInSelectedRange = rangeEnd > value[0] && rangeStart < value[1]

            const handleBarClick = () => {
              // Ajustamos para que no colapse el rango: si el bucket es de un solo paso, mantenemos ese ancho
              const bucketMin = rangeStart
              const bucketMax = Math.max(
                rangeStart + distributionStep,
                bucketStartToAtLeast(min, max, distributionStep, rangeStart)
              )
              onChange([Math.max(min, bucketMin), Math.min(max, bucketMax)])
            }

            return (
              <div
                key={index}
                className={`flex-1 transition-colors duration-200 ${isInSelectedRange ? 'bg-blue-400 opacity-80' : 'bg-gray-300 opacity-60'} cursor-pointer`}
                style={{ height: `${height}%` }}
                title={`${formatValue(rangeStart)} - ${formatValue(rangeEnd)}: ${count} unidades`}
                onClick={handleBarClick}
                role="button"
                aria-label={`Filtrar por ${formatValue(rangeStart)} a ${formatValue(rangeEnd)} (${count} unidades)`}
                tabIndex={0}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBarClick()}
              />
            )
          })}
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          Distribución de unidades por rango de precio
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <div
          ref={sliderRef}
          className="relative h-3 bg-gray-200 rounded-lg cursor-pointer"
          onClick={handleTrackClick}
        >
          {/* Track activo entre los dos handles */}
          <div
            className="absolute h-3 bg-blue-600 rounded-lg"
            style={{
              left: `${minPercentage}%`,
              width: `${maxPercentage - minPercentage}%`,
            }}
          />

          {/* Handle mínimo */}
          <div
            className={`absolute w-6 h-6 bg-white border-2 border-blue-600 rounded-full cursor-grab transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-lg hover:scale-110 transition-transform ${
              isDragging === 'min' ? 'cursor-grabbing scale-110 ring-2 ring-blue-300' : ''
            }`}
            style={{ left: `${minPercentage}%` }}
            onMouseDown={handleMouseDown('min')}
          />

          {/* Handle máximo */}
          <div
            className={`absolute w-6 h-6 bg-white border-2 border-blue-600 rounded-full cursor-grab transform -translate-x-1/2 -translate-y-1/2 top-1/2 shadow-lg hover:scale-110 transition-transform ${
              isDragging === 'max' ? 'cursor-grabbing scale-110 ring-2 ring-blue-300' : ''
            }`}
            style={{ left: `${maxPercentage}%` }}
            onMouseDown={handleMouseDown('max')}
          />
        </div>
      </div>

      {/* Etiquetas de límites */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}

const STORAGE_KEY = 'np:selectedUnitId'

export default function NuevoProceso() {
  const router = useRouter()

  const [units, setUnits] = useState<AvailableUnit[]>([])
  const [allUnits, setAllUnits] = useState<AvailableUnit[]>([]) // Para calcular rangos dinámicos
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<PropertyWithAvailableUnits[]>([])
  const [selectedUnit, setSelectedUnit] = useState<AvailableUnit | null>(null)
  const [showReserveModal, setShowReserveModal] = useState(false)

  const selectAndGo = (unitId: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, unitId)
    } catch {}
    router.push('/dashboard/admin/seleccion-de-usuario')
  }

  // Calcular rangos dinámicos basados en todas las unidades disponibles
  const priceRange = useMemo(() => {
    if (allUnits.length === 0) {
      return { min: 300000, max: 5000000, step: 50000 }
    }

    const prices = allUnits
      .map((unit) => unit.baseRent)
      .filter((price): price is number => price !== null && price !== undefined)
      .sort((a, b) => a - b)

    if (prices.length === 0) {
      return { min: 300000, max: 5000000, step: 50000 }
    }

    const min = Math.floor(prices[0] / 50000) * 50000 // Redondear hacia abajo
    const max = Math.ceil(prices[prices.length - 1] / 50000) * 50000 // Redondear hacia arriba

    return { min, max, step: 50000 }
  }, [allUnits])

  // Calcular distribución de precios para el histograma
  const priceDistribution = useMemo(() => {
    const { min, max, step } = priceRange
    const bucketCount = Math.ceil((max - min) / step)
    const distribution = new Array(bucketCount).fill(0)

    allUnits.forEach((unit) => {
      if (unit.baseRent !== null && unit.baseRent !== undefined) {
        const bucketIndex = Math.floor((unit.baseRent - min) / step)
        if (bucketIndex >= 0 && bucketIndex < bucketCount) {
          distribution[bucketIndex]++
        }
      }
    })

    return distribution
  }, [allUnits, priceRange])

  const [filters, setFilters] = useState({
    propertyId: '',
    priceRange: [priceRange.min, priceRange.max] as [number, number],
    bedrooms: '',
    bathrooms: '',
    furnished: '',
    petFriendly: '',
    smokingAllowed: '',
    parking: '',
    balcony: '',
    city: '',
    neighborhood: '',
    propertyType: '',
  })

  // Actualizar el rango de precios en filtros cuando cambien los datos
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [priceRange.min, priceRange.max],
    }))
  }, [priceRange])

  // Para evitar condiciones de carrera al hacer requests consecutivos
  const reqCounter = useRef(0)

  const buildCleanFilters = () => {
    const clean: Record<string, unknown> = {}

    // 1) Convierte el rango de precios a min/max
    if (filters.priceRange[0] > priceRange.min) clean.minRent = filters.priceRange[0]
    if (filters.priceRange[1] < priceRange.max) clean.maxRent = filters.priceRange[1]

    // 2) Excluye priceRange y procesa solo strings
    const { priceRange: _omit, ...flat } = filters

    ;(Object.keys(flat) as Array<keyof typeof flat>).forEach((key) => {
      const value = flat[key] // aquí value es string (por el tipo de filters)

      if (value !== '') {
        if (key === 'bedrooms') {
          clean[key as string] = parseInt(value, 10)
        } else if (key === 'bathrooms') {
          clean[key as string] = parseFloat(value)
        } else if (
          key === 'furnished' ||
          key === 'petFriendly' ||
          key === 'smokingAllowed' ||
          key === 'parking' ||
          key === 'balcony'
        ) {
          clean[key as string] = value === 'true'
        } else {
          clean[key as string] = value
        }
      }
    })

    return clean
  }

  const loadAllUnits = async () => {
    try {
      const result = await getAvailableUnitsAction({})
      if (result.success) {
        setAllUnits(result.data ?? [])
      }
    } catch (error) {
      console.error('Error al cargar todas las unidades:', error)
    }
  }

  const loadUnits = async () => {
    setLoading(true)
    const currentReq = ++reqCounter.current

    try {
      const cleanFilters = buildCleanFilters()
      const result = await getAvailableUnitsAction(cleanFilters)

      if (currentReq === reqCounter.current) {
        if (result.success) setUnits(result.data ?? [])
        else {
          console.error(result.error)
          setUnits([])
        }
      }
    } catch (error) {
      if (currentReq === reqCounter.current) {
        console.error('Error al cargar unidades:', error)
        setUnits([])
      }
    } finally {
      if (currentReq === reqCounter.current) setLoading(false)
    }
  }

  const loadProperties = async () => {
    try {
      const result = await getPropertiesWithAvailableUnitsAction()
      if (result.success) setProperties(result.data ?? [])
      else setProperties([])
    } catch (error) {
      console.error('Error al cargar propiedades:', error)
      setProperties([])
    }
  }

  // Cargar al montar
  useEffect(() => {
    loadAllUnits() // Cargar primero todas las unidades para rangos
    loadProperties()
  }, [])

  // Cargar unidades filtradas cuando cambian los filtros
  useEffect(() => {
    if (allUnits.length > 0) {
      // Solo después de tener todas las unidades
      loadUnits()
    }
  }, [allUnits]) // Primer carga después de obtener todas las unidades

  // Auto-buscar cuando cambian los filtros (con debounce)
  useEffect(() => {
    if (allUnits.length === 0) return // No buscar hasta tener los rangos

    const t = setTimeout(() => {
      loadUnits()
    }, 350)
    return () => clearTimeout(t)
  }, [filters, allUnits])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handlePriceRangeChange = (newRange: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: newRange }))
  }

  const handleSelectUnit = (unit: AvailableUnit) => {
    setSelectedUnit(unit)
    setShowReserveModal(true)
  }

  const formatCurrency = (amount?: number | null) => {
    if (amount == null) return 'No especificado'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getBooleanIcon = (value: boolean) =>
    value ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />

  // Calcular estadísticas del rango seleccionado
  const selectedRangeStats = useMemo(() => {
    const unitsInRange = allUnits.filter(
      (unit) =>
        unit.baseRent !== null &&
        unit.baseRent !== undefined &&
        unit.baseRent >= filters.priceRange[0] &&
        unit.baseRent <= filters.priceRange[1]
    )

    return {
      count: unitsInRange.length,
      percentage: allUnits.length > 0 ? Math.round((unitsInRange.length / allUnits.length) * 100) : 0,
    }
  }, [allUnits, filters.priceRange])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Selección de Unidades Disponibles</h1>
        <p className="text-gray-600">Encuentra y selecciona unidades disponibles para alquilar</p>
      </div>

      {/* Filtros de búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Filtros de Búsqueda
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Propiedad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Propiedad</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.propertyId}
              onChange={(e) => handleFilterChange('propertyId', e.target.value)}
            >
              <option value="">Todas las propiedades</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.city} ({property._count.units} disponibles)
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Precios - Componente dinámico */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rango de Precios
              <span className="text-xs text-gray-500 font-normal ml-2">
                ({selectedRangeStats.count} unidades, {selectedRangeStats.percentage}% del total)
              </span>
            </label>
            {allUnits.length > 0 && (
              <PriceRangeSlider
                min={priceRange.min}
                max={priceRange.max}
                step={priceRange.step}
                value={filters.priceRange}
                onChange={handlePriceRangeChange}
                priceDistribution={priceDistribution}
                distributionStep={priceRange.step}
              />
            )}
          </div>

          {/* Habitaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Habitaciones</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            >
              <option value="">Cualquier cantidad</option>
              <option value="0">Estudio</option>
              <option value="1">1 habitación</option>
              <option value="2">2 habitaciones</option>
              <option value="3">3 habitaciones</option>
              <option value="4">4+ habitaciones</option>
            </select>
          </div>

          {/* Baños */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Baños</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.bathrooms}
              onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
            >
              <option value="">Cualquier cantidad</option>
              <option value="1">1 baño</option>
              <option value="1.5">1.5 baños</option>
              <option value="2">2 baños</option>
              <option value="3">3+ baños</option>
            </select>
          </div>

          {/* Amoblado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amoblado</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.furnished}
              onChange={(e) => handleFilterChange('furnished', e.target.value)}
            >
              <option value="">Sin preferencia</option>
              <option value="true">Sí, amoblado</option>
              <option value="false">No amoblado</option>
            </select>
          </div>

          {/* Mascotas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Acepta mascotas</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.petFriendly}
              onChange={(e) => handleFilterChange('petFriendly', e.target.value)}
            >
              <option value="">Sin preferencia</option>
              <option value="true">Sí, acepta mascotas</option>
              <option value="false">No acepta mascotas</option>
            </select>
          </div>

          {/* Estacionamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estacionamiento</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.parking}
              onChange={(e) => handleFilterChange('parking', e.target.value)}
            >
              <option value="">Sin preferencia</option>
              <option value="true">Con estacionamiento</option>
              <option value="false">Sin estacionamiento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Unidades Disponibles ({units.length})</h2>
          <div className="text-sm text-gray-600">
            Rango: {formatCurrency(filters.priceRange[0])} - {formatCurrency(filters.priceRange[1])}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando unidades...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-8">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No se encontraron unidades disponibles</p>
            <p className="text-sm text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        <Link
                          href="/dashboard/admin/nuevo-proceso/seleccion-de-usuario"
                          prefetch={false}
                          onClick={() => selectAndGo(unit.id)}
                          className="hover:underline cursor-pointer"
                        >
                          Unidad {unit.unitNumber}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {unit.property.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {unit.property.city}, {unit.property.neighborhood}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(unit.baseRent)}</p>
                      <p className="text-xs text-gray-500">/ mes</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Bed className="w-4 h-4 mr-2" />
                      {unit.bedrooms} hab.
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Bath className="w-4 h-4 mr-2" />
                      {unit.bathrooms} baños
                    </div>
                    {unit.area && <div className="text-sm text-gray-600">📐 {unit.area}m²</div>}
                    {unit.floor !== null && <div className="text-sm text-gray-600">🏢 Piso {unit.floor}</div>}
                  </div>

                  {/* Características */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span>Amoblado:</span>
                      {getBooleanIcon(unit.furnished)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mascotas:</span>
                      {getBooleanIcon(unit.petFriendly)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Estacionamiento:</span>
                      {getBooleanIcon(unit.parking)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Balcón:</span>
                      {getBooleanIcon(unit.balcony)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Internet:</span>
                      {getBooleanIcon(unit.internet)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cable TV:</span>
                      {getBooleanIcon(unit.cableTV)}
                    </div>
                  </div>

                  {unit.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{unit.description}</p>
                  )}

                  <div className="flex space-x-2">
                    <Link
                      href="/dashboard/admin/nuevo-proceso/seleccion-de-usuario"
                      prefetch={false}
                      onClick={() => selectAndGo(unit.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Seleccionar Unidad
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de reserva */}
      {showReserveModal && selectedUnit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reservar Unidad {selectedUnit.unitNumber}</h3>
            <p className="text-gray-600 mb-4">
              {selectedUnit.property.name} - {formatCurrency(selectedUnit.baseRent)}/mes
            </p>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Funcionalidad de reserva en desarrollo</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowReserveModal(false)
                    setSelectedUnit(null)
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Confirmar Reserva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
