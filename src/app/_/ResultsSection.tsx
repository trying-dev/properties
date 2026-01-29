import { Search } from 'lucide-react'
import type { AvailableUnit } from '+/actions/nuevo-proceso'
import PropertyCard from '../fragments/PropertyCard'

type ResultsSectionProps = {
  units: AvailableUnit[]
  onClearFilters: () => void
}

export default function ResultsSection({ units, onClearFilters }: ResultsSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{units.length}</span> propiedades disponibles
        </p>
        <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
          <option>Más recientes</option>
          <option>Precio: menor a mayor</option>
          <option>Precio: mayor a menor</option>
          <option>Área: mayor a menor</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit, index) => (
          <PropertyCard key={unit.id} unit={unit} index={index} />
        ))}
      </div>

      {units.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron propiedades</h3>
          <p className="text-gray-600 mb-6">Intenta ajustar tus filtros de búsqueda</p>
          <button
            onClick={onClearFilters}
            className="text-sm font-medium text-gray-900 hover:text-gray-700 underline"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </section>
  )
}
