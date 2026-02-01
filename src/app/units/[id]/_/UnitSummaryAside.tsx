import { Bath, Bed, Heart, Maximize, Share2 } from 'lucide-react'
import type { UnitWithRelations } from '+/actions/nuevo-proceso'
import ReservationActions from './ReservationActions'
import { formatArea, formatPrice } from './utils'

type UnitSummaryAsideProps = {
  unit: NonNullable<UnitWithRelations>
  isAuthenticated: boolean
}

export default function UnitSummaryAside({ unit, isAuthenticated }: UnitSummaryAsideProps) {
  return (
    <aside className="space-y-4">
      <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">Reseñas</p>
            <p className="text-xl font-semibold text-gray-900">Fabuloso</p>
            <p className="text-xs text-gray-500">2,760 reseñas</p>
          </div>
          <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-lg font-semibold">8.7</div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-800 font-medium mb-2">Lo que más gustó</p>
          <p className="text-sm text-gray-600">“Ubicación, limpieza, buen tamaño de habitaciones, excelente edificio.”</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-md">Precio</div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(unit.baseRent)}</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-700">
          <span className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>{unit.bedrooms} hab</span>
          </span>
          <span className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span>{unit.bathrooms} baños</span>
          </span>
          <span className="flex items-center space-x-1">
            <Maximize className="w-4 h-4" />
            <span>{formatArea(unit.area)}</span>
          </span>
        </div>
        <div className="flex gap-3">
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
            <Heart className="w-5 h-5 text-gray-700" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <ReservationActions isAuthenticated={isAuthenticated} unitId={unit.id} />
      </div>
    </aside>
  )
}
