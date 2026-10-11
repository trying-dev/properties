export type LatLng = { lat: number; lng: number }

/**
 * Parsea `Property.gpsCoordinates` ("lat,lng"). Tolera espacios y texto extra
 * (p. ej. "4.68, -74.08 # confirmar"). Devuelve null si no es válido o es "0,0".
 */
export function parseGpsCoordinates(value?: string | null): LatLng | null {
  if (!value) return null
  const match = value.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null
  if (lat === 0 && lng === 0) return null
  return { lat, lng }
}

/** "Calle 1 #2, Barrio, Ciudad" omitiendo las partes vacías (sin comas sueltas). */
export function formatAddress(parts: { street?: string | null; number?: string | null; neighborhood?: string | null; city?: string | null }) {
  const street = [parts.street, parts.number].map((v) => v?.trim()).filter(Boolean).join(' ')
  return [street, parts.neighborhood?.trim(), parts.city?.trim()].filter(Boolean).join(', ')
}
