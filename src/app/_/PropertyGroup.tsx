'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import type { HomeUnit } from '+/actions/nuevo-proceso'
import type { PropertyWithOccupancy } from '+/actions/occupancy'
import OccupancyBadge from '+/components/OccupancyBadge'

const propertyTypeLabel: Record<string, string> = {
  HOUSE: 'Casa',
  BUILDING: 'Edificio',
  APARTMENT: 'Apartamento',
  COMMERCIAL_SPACE: 'Local comercial',
  OFFICE: 'Oficina',
  LAND: 'Terreno',
}

function parseImages(images?: string | null): string[] {
  if (!images) return []
  try {
    return JSON.parse(images) as string[]
  } catch {
    return []
  }
}

const formatPrice = (rent?: number | null) =>
  rent ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(rent) : 'Consultar'

export default function PropertyGroup({ property, units }: { property: PropertyWithOccupancy; units: HomeUnit[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-start justify-between gap-4 bg-gray-50 px-5 py-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
            <span className="text-xs text-gray-500">{propertyTypeLabel[property.propertyType] ?? property.propertyType}</span>
          </div>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {property.street} {property.number}, {property.neighborhood}, {property.city}
          </p>
        </div>
        <OccupancyBadge status={property.occupancyStatus} vacantUnits={property.vacantUnits} totalUnits={property.totalUnits} />
      </div>

      <div className="divide-y divide-gray-100">
        {units.map((unit) => {
          const image = parseImages(unit.images)[0] || '/placeholder-apartment.jpg'
          return (
            <Link key={unit.id} href={`/units/${unit.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={property.name} className="h-16 w-20 rounded-lg object-cover bg-gray-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{formatPrice(unit.baseRent)}</p>
                <p className="text-xs text-gray-600">
                  {unit.area ? `${unit.area} m²` : 'N/D'} · {unit.bedrooms ? `${unit.bedrooms} hab.` : 'N/D'}
                </p>
              </div>
              <span className="text-xs font-medium text-gray-900 underline shrink-0">Ver</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
