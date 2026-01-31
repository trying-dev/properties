import type { ReactNode } from 'react'
import { MapPin, ParkingSquare, Wifi } from 'lucide-react'
import type { UnitWithRelations } from '+/actions/nuevo-proceso'
import ReservationActions from './ReservationActions'

type HighlightBullet = { label: string; text: string }
type HighlightBlock = { title: string; bullets: HighlightBullet[]; footnote?: string }

type HighlightsSectionProps = {
  unit: NonNullable<UnitWithRelations>
  isAuthenticated: boolean
  rawHighlights: unknown
}

const normalizeHighlights = (raw: unknown, propertyName: string): HighlightBlock => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : (raw as HighlightBlock | null)
    if (parsed && Array.isArray(parsed.bullets)) {
      return {
        title: parsed.title || `Vive una experiencia en ${propertyName}`,
        bullets: parsed.bullets,
        footnote: parsed.footnote || '',
      }
    }
  } catch {
    // ignore parse errors
  }
  return {
    title: `Vive una experiencia de alto nivel en ${propertyName}`,
    bullets: [
      { label: 'Alojamiento cómodo', text: 'Espacios con buena luz y WiFi incluido.' },
      { label: 'Comodidades prácticas', text: 'Check-in flexible, parqueadero e internet disponibles.' },
      {
        label: 'Estilo de vida',
        text: 'Ambientes listos para estancias cortas o largas; balcones en piso 2 donde aplique.',
      },
      {
        label: 'Ubicación',
        text: 'Cerca de servicios y transporte público; ideal para explorar caminando.',
      },
    ],
    footnote: 'Residentes destacan la ubicación y la comodidad diaria.',
  }
}

export default function HighlightsSection({ unit, isAuthenticated, rawHighlights }: HighlightsSectionProps) {
  const highlights = normalizeHighlights(rawHighlights, unit.property.name)

  return (
    <section className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">{highlights.title}</h2>
        <div className="space-y-4 text-sm text-gray-800 leading-6">
          {highlights.bullets.map((item) => (
            <p key={item.label}>
              <strong>{item.label}:</strong> {item.text}
            </p>
          ))}
          {highlights.footnote && <p className="font-semibold">{highlights.footnote}</p>}
        </div>
        <p className="text-xs text-gray-500">
          Distance in property description is calculated using OpenStreetMap
        </p>
      </div>

      <aside className="space-y-4">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Propiedad</p>
              <p className="text-sm font-semibold text-gray-900">{unit.property.name}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">{unit.property.city}</span>
              <p className="text-xs text-gray-500">{unit.property.neighborhood}</p>
            </div>
          </div>

          <div className="bg-blue-50 px-4 py-4 space-y-3">
            <h3 className="text-base font-semibold text-gray-900">Highlights</h3>
            <p className="text-sm text-gray-700 flex items-start space-x-2">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span>
                {unit.property.street} {unit.property.number}, {unit.property.city}. Barrio{' '}
                {unit.property.neighborhood}.
              </span>
            </p>
            <div className="space-y-1 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">Incluye</p>
              {unit.parking && (
                <Pill icon={<ParkingSquare className="w-4 h-4 mt-0.5" />} label="Parqueadero disponible" />
              )}
              {unit.internet && (
                <Pill icon={<Wifi className="w-4 h-4 mt-0.5" />} label="Internet incluido" />
              )}
              {unit.waterIncluded && <p className="pl-6">Agua incluida</p>}
              {unit.gasIncluded && <p className="pl-6">Gas incluido</p>}
              {unit.furnished && <p className="pl-6">Amoblado</p>}
              {unit.petFriendly && <p className="pl-6">Pet friendly</p>}
            </div>
            <ReservationActions isAuthenticated={isAuthenticated} buttonLabel="Reserve" unitId={unit.id} />
          </div>
        </div>
      </aside>
    </section>
  )
}

function Pill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <p className="flex items-start space-x-2">
      {icon}
      <span>{label}</span>
    </p>
  )
}
