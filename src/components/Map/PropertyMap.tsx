'use client'

import { AttributionControl, MapContainer, Marker, TileLayer } from 'react-leaflet'
import { pinIcon } from './map-icon'
import { TILE_URL } from './map-tiles'

// Atribución mínima (sin el prefijo "Leaflet"); la licencia de OpenStreetMap exige mantener el crédito.
const SHORT_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OSM</a>'

import 'leaflet/dist/leaflet.css'
import './map.css'

/** Mapa pequeño de una sola ubicación. */
export default function PropertyMap({
  lat,
  lng,
  label,
  zoom = 16,
  interactive = true,
}: {
  lat: number
  lng: number
  label: string
  zoom?: number
  /** false: se ve como una imagen (sin controles, arrastre ni zoom). */
  interactive?: boolean
}) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      attributionControl={false}
      zoomControl={interactive}
      dragging={interactive}
      touchZoom={interactive}
      doubleClickZoom={interactive}
      boxZoom={interactive}
      keyboard={interactive}
      scrollWheelZoom={interactive}
      wheelPxPerZoomLevel={40} // más sensible: el touchpad envía deltas pequeños
      style={{ height: '100%', width: '100%' }}
      aria-label={label}
    >
      <TileLayer attribution={SHORT_ATTRIBUTION} url={TILE_URL} />
      <AttributionControl position="bottomright" prefix={false} />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  )
}
