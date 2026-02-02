'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import type { Unit, UnitStatus } from '@prisma/client'
import CreateUnitModal from './CreateUnitModal'

const unitStatusLabel: Record<UnitStatus, string> = {
  VACANT: 'Vacante',
  OCCUPIED: 'Ocupada',
  RESERVED: 'Reservada',
  MAINTENANCE: 'Mantenimiento',
  UNAVAILABLE: 'No disponible',
}

const formatNumber = (value?: number | null, suffix = '') => {
  if (value == null) return '-'
  return `${value}${suffix}`
}

type PropertyUnitsProps = {
  propertyId: string
  units: Unit[]
}

export default function PropertyUnits({ propertyId, units }: PropertyUnitsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Unidades</h2>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
        >
          <Plus className="w-4 h-4" />
          Nueva unidad
        </button>
      </div>
      {units.length === 0 ? (
        <p className="text-sm text-gray-600">No hay unidades registradas en esta propiedad.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {units.map((unit) => (
            <Link
              key={unit.id}
              href={`/dashboard/admin/units/${unit.id}`}
              className="rounded-lg border border-gray-100 p-4 hover:border-gray-200 hover:shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Unidad {unit.unitNumber}</p>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">{unitStatusLabel[unit.status]}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="text-gray-500">Área</span>
                  <p className="font-medium text-gray-900">{formatNumber(unit.area, ' m²')}</p>
                </div>
                <div>
                  <span className="text-gray-500">Piso</span>
                  <p className="font-medium text-gray-900">{formatNumber(unit.floor)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Habitaciones</span>
                  <p className="font-medium text-gray-900">{formatNumber(unit.bedrooms)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Baños</span>
                  <p className="font-medium text-gray-900">{formatNumber(unit.bathrooms)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amoblado</span>
                  <p className="font-medium text-gray-900">{unit.furnished ? 'Sí' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Canon</span>
                  <p className="font-medium text-gray-900">{unit.baseRent != null ? `$${unit.baseRent.toLocaleString('es-CO')}` : '-'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <CreateUnitModal isOpen={isOpen} onClose={() => setIsOpen(false)} propertyId={propertyId} />
    </div>
  )
}
