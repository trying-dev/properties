'use client'

import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { useRouter } from 'next/navigation'
import { MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { pinIcon } from './map-icon'
import { TILE_ATTRIBUTION, TILE_URL } from './map-tiles'

import 'leaflet/dist/leaflet.css'
import './map.css'

export type MapUnitLink = {
  href: string
  label: string
  /** Precio (o texto principal) que se muestra en la tarjeta. */
  detail?: string
  imageUrl?: string | null
  /** Si falta, se usa la dirección de la propiedad. */
  address?: string
}

export type MapPropertyMarker = {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  imageUrl?: string | null
  /** Etiqueta corta, p. ej. "Desde $1.200.000 · 3 disponibles". */
  subtitle?: string
  /** Unidades: al hacer clic en el pin salen como globos conectados a la propiedad. */
  links?: MapUnitLink[]
}

const DEFAULT_CENTER: [number, number] = [4.711, -74.0721] // Bogotá
const BUBBLE_W = 156
const BUBBLE_H = 128

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const cardHtml = (link: MapUnitLink, fallbackAddress: string, left: number, top: number, scale: number) =>
  `<div class="app-unit-bubble__body" data-href="${escapeHtml(link.href)}" title="${escapeHtml(link.label)}" style="left:${left}px;top:${top}px;--s:${scale}">${
    link.imageUrl
      ? `<div class="app-unit-bubble__img" style="background-image:url('${escapeHtml(encodeURI(link.imageUrl))}')"></div>`
      : '<div class="app-unit-bubble__img"></div>'
  }<div class="app-unit-bubble__text"><strong>${escapeHtml(link.detail ?? link.label)}</strong><span>${escapeHtml(
    link.address ?? fallbackAddress,
  )}</span></div></div>`

/**
 * Un solo DivIcon anclado al pin con las tarjetas en círculo y sus líneas. Al vivir dentro del
 * marcador, las tarjetas conservan su distancia en píxeles al pin durante y después del zoom.
 */
function clusterIcon(marker: MapPropertyMarker) {
  const links = marker.links ?? []
  // Con muchas unidades las tarjetas se reducen para que el círculo no se salga del mapa.
  const scale = links.length <= 5 ? 1 : links.length <= 8 ? 0.85 : 0.7
  const step = Math.max(BUBBLE_W, BUBBLE_H) * scale + 18
  const radius = Math.max(100, (links.length * step) / (2 * Math.PI))
  const half = Math.ceil(radius + Math.max(BUBBLE_W, BUBBLE_H))
  const size = half * 2
  const items = links.map((link, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / links.length
    return { link, dx: radius * Math.cos(angle), dy: radius * Math.sin(angle) }
  })
  const lines = items
    .map(({ dx, dy }) => `<line x1="${half}" y1="${half}" x2="${half + dx}" y2="${half + dy}" />`)
    .join('')
  const cards = items
    .map(({ link, dx, dy }) => cardHtml(link, marker.address, half + dx - BUBBLE_W / 2, half + dy - BUBBLE_H / 2, scale))
    .join('')
  return L.divIcon({
    className: 'app-unit-cluster',
    html: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="app-unit-cluster__lines">${lines}</svg>${cards}`,
    iconSize: [size, size],
    iconAnchor: [half, half],
  })
}

function FitBounds({ markers }: { markers: MapPropertyMarker[] }) {
  const map = useMap()
  useEffect(() => {
    if (markers.length === 0) return
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 15)
      return
    }
    map.fitBounds(
      markers.map((m) => [m.lat, m.lng] as [number, number]),
      { padding: [40, 40], maxZoom: 16 },
    )
  }, [map, markers])
  return null
}

/** Cierra las tarjetas al hacer clic en el mapa. */
function MapEvents({ onBackgroundClick }: { onBackgroundClick: () => void }) {
  useMapEvents({ click: onBackgroundClick })
  return null
}

/** Unidades de una propiedad como tarjetas en círculo alrededor del pin, unidas por líneas. */
function UnitBubbles({ marker }: { marker: MapPropertyMarker }) {
  const map = useMap()
  const router = useRouter()
  const icon = useMemo(() => clusterIcon(marker), [marker])

  useEffect(() => {
    map.panTo([marker.lat, marker.lng], { animate: true })
  }, [map, marker.lat, marker.lng])

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
      zIndexOffset={1000}
      keyboard={false}
      eventHandlers={{
        click: (event) => {
          const target = (event.originalEvent.target as HTMLElement | null)?.closest<HTMLElement>('[data-href]')
          if (target?.dataset.href) router.push(target.dataset.href)
        },
      }}
    />
  )
}

export default function PropertiesMap({ markers, height = '70vh' }: { markers: MapPropertyMarker[]; height?: string }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const first = markers[0]
  const active = markers.find((m) => m.id === activeId && m.links?.length) ?? null

  return (
    <MapContainer
      center={first ? [first.lat, first.lng] : DEFAULT_CENTER}
      zoom={12}
      scrollWheelZoom
      style={{ height, minHeight: '420px', width: '100%' }}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <FitBounds markers={markers} />
      <MapEvents onBackgroundClick={() => setActiveId(null)} />

      {markers.map((marker) => {
        const expandable = Boolean(marker.links?.length)
        return (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={pinIcon}
            eventHandlers={expandable ? { click: () => setActiveId((current) => (current === marker.id ? null : marker.id)) } : undefined}
          >
            {expandable ? (
              <Tooltip direction="top" offset={[0, -34]} permanent={marker.id === activeId} className="app-map-tooltip">
                <strong>{marker.name}</strong>
                {marker.subtitle ? <span className="block">{marker.subtitle}</span> : null}
              </Tooltip>
            ) : (
              <Popup className="app-map-popup" minWidth={220} maxWidth={240}>
                <div className="overflow-hidden rounded-xl">
                  {marker.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={marker.imageUrl} alt={marker.name} className="h-28 w-full object-cover bg-gray-100" />
                  ) : null}
                  <div className="space-y-1 p-3">
                    <p className="font-semibold text-gray-900 leading-tight">{marker.name}</p>
                    <p className="text-xs text-gray-600">{marker.address}</p>
                    {marker.subtitle ? <p className="text-xs font-medium text-gray-900">{marker.subtitle}</p> : null}
                  </div>
                </div>
              </Popup>
            )}
          </Marker>
        )
      })}

      {active && <UnitBubbles key={active.id} marker={active} />}
    </MapContainer>
  )
}
