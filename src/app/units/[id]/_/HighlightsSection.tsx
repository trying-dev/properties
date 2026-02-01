import PropertyHighlightsCard from './PropertyHighlightsCard'
import type { UnitWithRelations } from '+/actions/nuevo-proceso'

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
        <p className="text-xs text-gray-500">Distance in property description is calculated using OpenStreetMap</p>
      </div>

      <aside className="space-y-4">
        <PropertyHighlightsCard unit={unit} isAuthenticated={isAuthenticated} />
      </aside>
    </section>
  )
}
