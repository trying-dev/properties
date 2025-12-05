'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, Search, MapPin, Bed, Bath, Maximize, Heart, SlidersHorizontal } from 'lucide-react'

const mockProperties = [
  {
    id: '1',
    name: 'Edificio Centro',
    unitNumber: '301',
    address: 'Calle 72 #10-34, Chapinero',
    city: 'Bogotá',
    price: 1200000,
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    image: '/placeholder-apartment.jpg',
    featured: true,
  },
  {
    id: '2',
    name: 'Torre Norte',
    unitNumber: '205',
    address: 'Carrera 15 #85-20, Usaquén',
    city: 'Bogotá',
    price: 1500000,
    bedrooms: 3,
    bathrooms: 2,
    area: 85,
    image: '/placeholder-apartment.jpg',
    featured: false,
  },
]

export default function PropertiesCatalog() {
  const [properties] = useState(mockProperties)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    priceMax: '',
    bedrooms: '',
    city: '',
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSearch = () => {
    console.log('Searching with:', searchQuery, filters)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Properties</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/propiedades" className="text-sm font-medium text-gray-900">
                Buscar
              </Link>
              <Link href="/sobre-nosotros" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sobre Nosotros
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/auth" className="text-sm font-medium text-gray-900 hover:text-gray-700">
                Registrarse
              </Link>
              <Link
                href="/auth"
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

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
                  <option value="bogota">Bogotá</option>
                  <option value="medellin">Medellín</option>
                  <option value="cali">Cali</option>
                  <option value="barranquilla">Barranquilla</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <button
                  onClick={handleSearch}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
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
            <span className="font-semibold text-gray-900">{properties.length}</span> propiedades disponibles
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
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/propiedades/${property.id}`}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 hover:shadow-lg transition-all group"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Home className="h-12 w-12 text-gray-400" />
                </div>
                {/* Favorite Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                  }}
                  className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 shadow-md"
                >
                  <Heart className="h-5 w-5 text-gray-600" />
                </button>
                {/* Featured Badge */}
                {property.featured && (
                  <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Destacado
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700">
                    {property.name} - Unidad {property.unitNumber}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {property.address}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </span>
                  <span className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </span>
                  <span className="flex items-center">
                    <Maximize className="h-4 w-4 mr-1" />
                    {property.area}m²
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Renta mensual</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(property.price)}</p>
                  </div>
                  <button className="text-sm font-medium text-gray-900 hover:text-gray-700">
                    Ver detalles →
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {properties.length === 0 && (
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

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Properties</span>
              </div>
              <p className="text-sm text-gray-600">Encuentra tu próximo hogar con nosotros</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Explorar</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/propiedades" className="hover:text-gray-900">
                    Buscar propiedades
                  </Link>
                </li>
                <li>
                  <Link href="/sobre-nosotros" className="hover:text-gray-900">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="hover:text-gray-900">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <Link href="/terminos" className="hover:text-gray-900">
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-gray-900">
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Email: info@properties.com</li>
                <li>Tel: +57 300 123 4567</li>
                <li>Lun - Vie: 8AM - 6PM</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            <p>© 2025 Properties. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
