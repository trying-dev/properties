'use client'

import { useState } from 'react'
import { ArrowRight, FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import type { UnitStatus } from '@prisma/client'
import type { PropertyUnitWithProcesses } from '+/actions/property'
import { processStatusConfig } from '+/lib/processStatus'
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

const tenantName = (process: PropertyUnitWithProcesses['processes'][number]) => {
  const user = process.tenant?.user
  if (!user) return 'Sin inquilino'
  return [user.name, user.lastName].filter(Boolean).join(' ') || user.email || 'Sin inquilino'
}

type PropertyUnitsProps = {
  propertyId: string
  units: PropertyUnitWithProcesses[]
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
            <div key={unit.id} className="rounded-lg border border-gray-100 p-4">
              <Link href={`/dashboard/admin/units/${unit.id}`} className="block group">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900 group-hover:text-blue-700">Unidad {unit.unitNumber}</p>
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

              {unit.processes.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3 space-y-2">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <FileText className="h-3.5 w-3.5" />
                    {unit.processes.length === 1 ? 'Proceso de alquiler' : `${unit.processes.length} procesos de alquiler`}
                  </p>
                  {unit.processes.map((process) => {
                    const config = processStatusConfig[process.status]
                    return (
                      <Link
                        key={process.id}
                        href={`/dashboard/admin/applications/${process.id}`}
                        className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 hover:border-blue-200 hover:bg-blue-50/40 transition"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">{tenantName(process)}</p>
                          <p className="text-xs text-gray-500">Paso {process.currentStep}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${config.box}`}>
                            {config.label}
                          </span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <CreateUnitModal isOpen={isOpen} onClose={() => setIsOpen(false)} propertyId={propertyId} />
    </div>
  )
}
