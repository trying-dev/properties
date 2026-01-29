import { Search, SlidersHorizontal } from 'lucide-react'
import ExtraFilters from './ExtraFilters'

export type Filters = {
  priceMax: string
  bedrooms: string
  city: string
}

type SearchSectionProps = {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  showFilters: boolean
  onToggleFilters: () => void
}

export default function SearchSection({
  searchQuery,
  onSearchQueryChange,
  filters,
  onFiltersChange,
  showFilters,
  onToggleFilters,
}: SearchSectionProps) {
  return (
    <section className="bg-linear-to-b from-gray-50 to-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Buscar Propiedad</h1>
          <p className="text-gray-600">Encuentra tu próximo hogar</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4">
              <input
                type="text"
                placeholder="Ciudad, dirección o código postal"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <input
                type="number"
                placeholder="Precio máximo"
                value={filters.priceMax}
                onChange={(e) => onFiltersChange({ ...filters, priceMax: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <select
                value={filters.bedrooms}
                onChange={(e) => onFiltersChange({ ...filters, bedrooms: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Habitaciones</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <select
                value={filters.city}
                onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Ciudad</option>
                <option value="bogotá">Bogotá</option>
                <option value="medellín">Medellín</option>
                <option value="cali">Cali</option>
                <option value="barranquilla">Barranquilla</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Buscar</span>
              </button>
            </div>
          </div>

          <button
            onClick={onToggleFilters}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900 flex items-center space-x-1"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Más filtros</span>
          </button>

          {showFilters && <ExtraFilters />}
        </div>
      </div>
    </section>
  )
}
