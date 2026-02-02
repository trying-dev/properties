import { notFound } from 'next/navigation'
import { ArrowLeft, Building2, MapPin } from 'lucide-react'
import Link from 'next/link'

import Header from '+/components/Header'
import { getPropertyWithUnits } from '+/actions/property'
import PropertyActions from './_/PropertyActions'
import PropertyUnits from './_/PropertyUnits'
import type { PropertyStatus, PropertyType } from '@prisma/client'

const statusLabel: Record<PropertyStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  MAINTENANCE: 'Mantenimiento',
  SOLD: 'Vendida',
}

const typeLabel: Record<PropertyType, string> = {
  HOUSE: 'Casa',
  BUILDING: 'Edificio',
  APARTMENT: 'Apartamento',
  COMMERCIAL_SPACE: 'Local comercial',
  OFFICE: 'Oficina',
  LAND: 'Lote',
}

const formatNumber = (value?: number | null, suffix = '') => {
  if (value == null) return '-'
  return `${value}${suffix}`
}

const parseCommonZones = (value?: string | null) => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default async function AdminPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await getPropertyWithUnits({ id })
  if (!property) return notFound()

  const commonZones = parseCommonZones(property.commonZones)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard/admin/properties" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-3">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a propiedades
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
            <p className="text-gray-600 mt-1">Detalle completo de la propiedad</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {typeLabel[property.propertyType]}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
              {statusLabel[property.status]}
            </span>
            <PropertyActions propertyId={property.id} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Información básica</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">{property.description || 'Sin descripción.'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium text-gray-900">{typeLabel[property.propertyType]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <p className="font-medium text-gray-900">{statusLabel[property.status]}</p>
                </div>
                <div>
                  <p className="text-gray-500">Área construida</p>
                  <p className="font-medium text-gray-900">{formatNumber(property.builtArea, ' m²')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Área total</p>
                  <p className="font-medium text-gray-900">{formatNumber(property.totalLandArea, ' m²')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pisos</p>
                  <p className="font-medium text-gray-900">{formatNumber(property.floors)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Antigüedad</p>
                  <p className="font-medium text-gray-900">{formatNumber(property.age, ' años')}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Dirección</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Calle</p>
                  <p className="font-medium text-gray-900">{property.street}</p>
                </div>
                <div>
                  <p className="text-gray-500">Número</p>
                  <p className="font-medium text-gray-900">{property.number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ciudad</p>
                  <p className="font-medium text-gray-900">{property.city}</p>
                </div>
                <div>
                  <p className="text-gray-500">Barrio</p>
                  <p className="font-medium text-gray-900">{property.neighborhood}</p>
                </div>
                <div>
                  <p className="text-gray-500">Departamento/Estado</p>
                  <p className="font-medium text-gray-900">{property.state}</p>
                </div>
                <div>
                  <p className="text-gray-500">Código postal</p>
                  <p className="font-medium text-gray-900">{property.postalCode}</p>
                </div>
                <div>
                  <p className="text-gray-500">País</p>
                  <p className="font-medium text-gray-900">{property.country}</p>
                </div>
                <div>
                  <p className="text-gray-500">Coordenadas</p>
                  <p className="font-medium text-gray-900">{property.gpsCoordinates || '-'}</p>
                </div>
              </div>
            </div>

            <PropertyUnits propertyId={property.id} units={property.units} />
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Exterior</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Jardín/Patio</p>
                  <p className="font-medium text-gray-900">{property.yardOrGarden || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Parqueaderos</p>
                  <p className="font-medium text-gray-900">{formatNumber(property.parking)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ubicación parqueadero</p>
                  <p className="font-medium text-gray-900">{property.parkingLocation || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Balcones/Terrazas</p>
                  <p className="font-medium text-gray-900">{property.balconiesAndTerraces || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Zonas recreativas</p>
                  <p className="font-medium text-gray-900">{property.recreationalAreas || '-'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-6 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Zonas comunes</h2>
              {commonZones.length === 0 ? (
                <p className="text-sm text-gray-600">No hay zonas comunes registradas.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {commonZones.map((zone, index) => (
                    <li key={`${zone?.name ?? 'zone'}-${index}`} className="rounded-lg border border-gray-100 p-3">
                      <p className="font-medium text-gray-900">{zone?.name ?? 'Zona común'}</p>
                      {zone?.description && <p className="text-gray-600 mt-1">{zone.description}</p>}
                      <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-3">
                        {zone?.capacity != null && <span>Capacidad: {zone.capacity}</span>}
                        {zone?.available != null && <span>{zone.available ? 'Disponible' : 'No disponible'}</span>}
                        {zone?.openingTime && <span>Apertura: {zone.openingTime}</span>}
                        {zone?.closingTime && <span>Cierre: {zone.closingTime}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
