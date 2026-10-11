import { parseGpsCoordinates } from '../components/Map/geo'

type AddressParts = {
  street?: string | null
  number?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'properties-app/1.0 (geocoding property addresses)'

const clean = (value?: string | null) => value?.trim() || ''

/** Consultas de la más específica a la más general (calle → barrio → ciudad). */
function buildQueries(a: AddressParts): string[] {
  const country = clean(a.country) || 'Colombia'
  const tail = [clean(a.city), clean(a.state), country].filter(Boolean)
  const queries: string[] = []
  const street = [clean(a.street), clean(a.number)].filter(Boolean).join(' ')
  if (street) queries.push([street, clean(a.neighborhood), ...tail].filter(Boolean).join(', '))
  if (clean(a.neighborhood)) queries.push([clean(a.neighborhood), ...tail].filter(Boolean).join(', '))
  if (clean(a.city)) queries.push(tail.join(', '))
  return [...new Set(queries)]
}

async function search(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'es' },
    next: { revalidate: 60 * 60 * 24 * 30 }, // las direcciones casi no cambian: cache 30 días
  })
  if (!res.ok) return null
  const [first] = (await res.json()) as { lat: string; lon: string }[]
  if (!first) return null
  const lat = Number(first.lat)
  const lng = Number(first.lon)
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
}

/**
 * Geocodifica una dirección con Nominatim (OpenStreetMap). Si la calle no se encuentra,
 * cae al barrio y luego a la ciudad. Devuelve "lat,lng" o null.
 * Política de uso de Nominatim: máx. 1 req/s, por eso las consultas son secuenciales.
 */
export async function geocodeAddress(address: AddressParts): Promise<string | null> {
  for (const query of buildQueries(address)) {
    try {
      const found = await search(query)
      if (found) return `${found.lat.toFixed(6)},${found.lng.toFixed(6)}`
    } catch (error) {
      console.error('Error geocodificando dirección:', query, error)
    }
  }
  return null
}

/** Devuelve las coordenadas dadas si son válidas; si no, intenta obtenerlas por dirección. */
export async function resolveGpsCoordinates(current: string | null | undefined, address: AddressParts) {
  if (parseGpsCoordinates(current)) return current!.trim()
  return geocodeAddress(address)
}
