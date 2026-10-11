'use client'

import dynamic from 'next/dynamic'
import { MapPinOff } from 'lucide-react'
import { parseGpsCoordinates } from './geo'
import type { MapPropertyMarker } from './PropertiesMap'

export type { MapPropertyMarker } from './PropertiesMap'
export { formatAddress, parseGpsCoordinates } from './geo'

// Leaflet toca `window`, por eso los mapas se cargan solo en el cliente.
const loading = () => <div className="h-full w-full min-h-[200px] animate-pulse bg-gray-100" />
const PropertyMapInner = dynamic(() => import('./PropertyMap'), { ssr: false, loading })
const PropertiesMapInner = dynamic(() => import('./PropertiesMap'), { ssr: false, loading })

type LocationMapProps = {
  /** Valor crudo de `Property.gpsCoordinates`. */
  gpsCoordinates?: string | null
  /** Dirección legible; se usa como etiqueta y para el enlace externo. */
  address?: string
  heightClass?: string
  className?: string
}

/** Mapa de una propiedad/unidad a partir de sus coordenadas. Si no hay coordenadas válidas muestra un aviso. */
export function LocationMap({ gpsCoordinates, address, heightClass = 'h-72', className = '' }: LocationMapProps) {
  const coords = parseGpsCoordinates(gpsCoordinates)

  return (
    <div className={`space-y-2 ${className}`}>
      <div className={`${heightClass} relative z-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50`}>
        {coords ? (
          <PropertyMapInner lat={coords.lat} lng={coords.lng} label={address ?? 'Ubicación'} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-500">
            <MapPinOff className="h-6 w-6" />
            Ubicación en el mapa no disponible
          </div>
        )}
      </div>
    </div>
  )
}

/** Recuadro de mapa que rellena su contenedor (sin enlaces ni texto); null si no hay coordenadas válidas. */
export function MiniMap({
  gpsCoordinates,
  label,
  interactive = true,
  zoom = 15,
}: {
  gpsCoordinates?: string | null
  label: string
  interactive?: boolean
  zoom?: number
}) {
  const coords = parseGpsCoordinates(gpsCoordinates)
  if (!coords) return null
  return <PropertyMapInner lat={coords.lat} lng={coords.lng} label={label} zoom={zoom} interactive={interactive} />
}

/** Mapa con varias propiedades (home / listados). */
export function PropertiesMap({ markers, heightClass = 'h-[70vh]' }: { markers: MapPropertyMarker[]; heightClass?: string }) {
  return (
    <div className={`${heightClass} relative z-0 min-h-[420px] overflow-hidden rounded-xl border border-gray-200`}>
      <PropertiesMapInner markers={markers} height="100%" />
    </div>
  )
}
