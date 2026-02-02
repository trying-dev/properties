'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { UnitStatus, Property } from '@prisma/client'

import Header from '+/components/Header'
import { getAdminUnitsAction } from '+/actions/units'
import { getProperties } from '+/actions/property'
import type { AdminUnitRow } from '+/actions/units'

const statusLabel: Record<UnitStatus, string> = {
  VACANT: 'Vacante',
  OCCUPIED: 'Ocupada',
  RESERVED: 'Reservada',
  MAINTENANCE: 'Mantenimiento',
  UNAVAILABLE: 'No disponible',
}

const formatAddress = (property: Property) =>
  `${property.street} ${property.number}, ${property.neighborhood}, ${property.city}`

export default function AdminUnitsPage() {
  const [units, setUnits] = useState<AdminUnitRow[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [status, setStatus] = useState<UnitStatus | ''>('')
  const [propertyId, setPropertyId] = useState('')
  const [city, setCity] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cities = useMemo(() => {
    const values = new Set<string>()
    properties.forEach((property) => {
      if (property.city) values.add(property.city)
    })
    return Array.from(values).sort()
  }, [properties])

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await getProperties()
        setProperties(data)
      } catch (err) {
        console.error('Error loading properties:', err)
      }
    }
    loadProperties()
  }, [])

  const loadUnits = async (filters?: { status?: UnitStatus; propertyId?: string; city?: string }) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getAdminUnitsAction(filters)
      if (!result.success || !result.data) {
        setError(result.error ?? 'No se pudieron cargar las unidades')
        setUnits([])
        return
      }
      setUnits(result.data)
    } catch (err) {
      console.error('Error loading units:', err)
      setError('No se pudieron cargar las unidades')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const filters = {
      status: status || undefined,
      propertyId: propertyId || undefined,
      city: city || undefined,
    }
    void loadUnits(filters)
  }, [status, propertyId, city])

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="mb-6">
          <Link href="/dashboard/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Unidades</h1>
            <p className="text-gray-600">Listado completo de unidades y sus contratos.</p>
          </div>
          <span className="bg-gray-900 text-white text-sm font-semibold px-3 py-1 rounded-full">{units.length}</span>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              Estado
              <select className="border rounded-lg px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value as UnitStatus | '')}>
                <option value="">Todos</option>
                {Object.values(UnitStatus).map((value) => (
                  <option key={value} value={value}>
                    {statusLabel[value]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              Propiedad
              <select className="border rounded-lg px-3 py-2" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
                <option value="">Todas</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-gray-700">
              Ciudad
              <select className="border rounded-lg px-3 py-2" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Todas</option>
                {cities.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Cargando unidades...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : units.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No hay unidades para los filtros seleccionados.</div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y">
            {units.map((unit) => {
              const latestContract = unit.contracts[0]
              const tenantName = latestContract?.tenant?.user
                ? `${latestContract.tenant.user.name} ${latestContract.tenant.user.lastName}`
                : '-'

              return (
                <div key={unit.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_200px_160px] gap-4 items-center">
                    <Link href={`/dashboard/admin/units/${unit.id}`} className="text-sm font-semibold text-gray-900 hover:text-blue-700">
                      Unidad {unit.unitNumber}
                    </Link>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{unit.property.name}</p>
                      <p className="text-xs text-gray-500">{formatAddress(unit.property)}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="text-xs text-gray-500">Contrato</p>
                      <p className="font-medium text-gray-900">{unit._count.contracts > 0 ? 'Sí' : 'No'}</p>
                      {unit._count.contracts > 0 && <p className="text-xs text-gray-500">Inquilino: {tenantName}</p>}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="text-xs text-gray-500">Estado</p>
                      <p className="font-medium text-gray-900">{statusLabel[unit.status]}</p>
                      <Link href={`/dashboard/admin/properties/${unit.propertyId}`} className="text-xs text-blue-600 hover:text-blue-700">
                        Ver propiedad
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
