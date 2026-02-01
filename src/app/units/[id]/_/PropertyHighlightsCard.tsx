import type { ReactNode } from 'react'
import { MapPin, ParkingSquare, Wifi } from 'lucide-react'

import type { UnitWithRelations } from '+/actions/nuevo-proceso'
import ReservationActions from './ReservationActions'

function Pill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <p className="flex items-start space-x-2">
      {icon}
      <span>{label}</span>
    </p>
  )
}

type PropertyHighlightsCardProps = {
  unit: NonNullable<UnitWithRelations>
  isAuthenticated: boolean
}

export default function PropertyHighlightsCard({ unit, isAuthenticated }: PropertyHighlightsCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Propiedad</p>
          <p className="text-sm font-semibold text-gray-900">{unit.property.name}</p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-bold text-gray-900">{unit.property.city}</span>
          <p className="text-xs text-gray-500">{unit.property.neighborhood}</p>
        </div>
      </div>

      <div className="bg-blue-50 px-4 py-4 space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Highlights</h3>

        <p className="text-sm text-gray-700 flex items-start space-x-2">
          <MapPin className="w-4 h-4 mt-0.5" />
          <span>
            {unit.property.street} {unit.property.number}, {unit.property.city}. Barrio {unit.property.neighborhood}.
          </span>
        </p>

        <div className="space-y-1 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Incluye</p>
          {unit.parking && <Pill icon={<ParkingSquare className="w-4 h-4 mt-0.5" />} label="Parqueadero disponible" />}
          {unit.internet && <Pill icon={<Wifi className="w-4 h-4 mt-0.5" />} label="Internet incluido" />}
          {unit.waterIncluded && <p className="pl-6">Agua incluida</p>}
          {unit.gasIncluded && <p className="pl-6">Gas incluido</p>}
          {unit.furnished && <p className="pl-6">Amoblado</p>}
          {unit.petFriendly && <p className="pl-6">Pet friendly</p>}
        </div>

        <ReservationActions isAuthenticated={isAuthenticated} buttonLabel="Reserve" unitId={unit.id} />
      </div>
    </div>
  )
}
