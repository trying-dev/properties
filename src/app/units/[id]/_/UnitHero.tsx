import { MapPin, Star } from 'lucide-react'
import type { UnitWithRelations } from '+/actions/nuevo-proceso'

type UnitHeroProps = {
  unit: NonNullable<UnitWithRelations>
}

export default function UnitHero({ unit }: UnitHeroProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 text-sm text-amber-500">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="ml-1 text-amber-600 font-semibold">5.0</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">
        {unit.property.name} — Unidad {unit.unitNumber}
      </h1>
      <div className="flex items-center flex-wrap gap-2 text-sm text-gray-700">
        <MapPin className="w-4 h-4" />
        <span>
          {unit.property.street} {unit.property.number}, {unit.property.city}, {unit.property.country}
        </span>
        <span className="text-blue-600 font-semibold">• Excelente ubicación</span>
      </div>
    </div>
  )
}
