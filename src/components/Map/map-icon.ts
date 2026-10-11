import L from 'leaflet'

// Pin SVG inline (sin assets externos). Leaflet usa `window`: importar solo desde componentes client-only (ssr: false).
const pin = (fill: string) =>
  L.divIcon({
    className: 'app-map-pin',
    html: `<svg width="28" height="38" viewBox="0 0 28 38" aria-hidden="true"><path d="M14 1C6.7 1 1 6.9 1 14c0 9.6 13 23 13 23s13-13.4 13-23C27 6.9 21.3 1 14 1Z" fill="${fill}" stroke="#ffffff" stroke-width="1.6"/><circle cx="14" cy="14" r="5.5" fill="#ffffff"/></svg>`,
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -34],
  })

export const pinIcon = pin('#111827')
export const activePinIcon = pin('#dc2626')
