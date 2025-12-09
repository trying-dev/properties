'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import { AvailableUnit, getAvailableUnitsAction } from '+/actions/nuevo-proceso'
import PropertyCard from './fragments/PropertyCard'
import Header from '+/components/Header'
import Footer from '+/components/Footer'

export default function PropertiesCatalog() {
  const [units, setUnits] = useState<AvailableUnit[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    priceMax: '',
    bedrooms: '',
    city: '',
  })

  useEffect(() => {
    ;(async () => {
      try {
        const result = await getAvailableUnitsAction({})
        if (result.success) setUnits(result.data ?? [])
      } catch (error) {
        console.error('Error loading units:', error)
      }
    })()
  }, [])

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const matchesSearch =
        !searchQuery ||
        unit.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${unit.property.city} ${unit.property.neighborhood}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      const matchesPrice = !filters.priceMax || (unit.baseRent ?? 0) <= Number(filters.priceMax)
      const matchesBedrooms = !filters.bedrooms || unit.bedrooms >= Number(filters.bedrooms)
      const matchesCity = !filters.city || unit.property.city.toLowerCase() === filters.city.toLowerCase()
      return matchesSearch && matchesPrice && matchesBedrooms && matchesCity
    })
  }, [units, searchQuery, filters])

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with Search */}
      <section className="bg-linear-to-b from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Buscar Propiedad</h1>
            <p className="text-gray-600">Encuentra tu próximo hogar</p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Location Input */}
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Ciudad, dirección o código postal"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Price Filter */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Precio máximo"
                    value={filters.priceMax}
                    onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Bedrooms Filter */}
              <div className="md:col-span-2">
                <select
                  value={filters.bedrooms}
                  onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Habitaciones</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* City Filter */}
              <div className="md:col-span-2">
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Ciudad</option>
                  <option value="bogotá">Bogotá</option>
                  <option value="medellín">Medellín</option>
                  <option value="cali">Cali</option>
                  <option value="barranquilla">Barranquilla</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Buscar</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Más filtros</span>
            </button>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Área mínima (m²)</label>
                    <input
                      type="number"
                      placeholder="50"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
                    <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900">
                      <option value="">Cualquiera</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">Amoblado</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">Parqueadero</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-sm text-gray-700">Acepta mascotas</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredUnits.length}</span> propiedades
            disponibles
          </p>
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
            <option>Más recientes</option>
            <option>Precio: menor a mayor</option>
            <option>Precio: mayor a menor</option>
            <option>Área: mayor a menor</option>
          </select>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit, index) => (
            <PropertyCard key={unit.id} unit={unit} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {filteredUnits.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron propiedades</h3>
            <p className="text-gray-600 mb-6">Intenta ajustar tus filtros de búsqueda</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setFilters({ priceMax: '', bedrooms: '', city: '' })
              }}
              className="text-sm font-medium text-gray-900 hover:text-gray-700 underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
