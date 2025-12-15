import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  Bath,
  Bed,
  Heart,
  MapPin,
  Maximize,
  Share2,
  Star,
  ParkingSquare,
  PawPrint,
  Wifi,
  Bath as BathIcon,
  Sun,
  Home,
  Tv,
  Flame,
  Package,
} from 'lucide-react'
import { getUnitByIdAction } from '+/actions/nuevo-proceso'
import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { auth } from '+/lib/auth'
import Gallery from './gallery'
import ReservationActions from './ReservationActions'

const formatPrice = (amount?: number | null) =>
  amount != null ? `${new Intl.NumberFormat('de-DE').format(amount)} €` : 'Precio a consultar'

const formatArea = (area?: number | null) => (area ? `${area} m²` : 'N/D')

const parseImages = (images?: string | null): string[] => {
  if (!images) return []
  try {
    return JSON.parse(images) as string[]
  } catch {
    return []
  }
}

export default async function UnitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  if (!id) {
    notFound()
  }

  const [result, session] = await Promise.all([getUnitByIdAction(id), auth()])

  if (!result.success || !result.data) {
    notFound()
  }

  const unit = result.data
  const images = parseImages(unit.images)
  const safeImages = images.length ? images : ['/placeholder-apartment.jpg']

  type HighlightBullet = { label: string; text: string }
  type HighlightBlock = { title: string; bullets: HighlightBullet[]; footnote?: string }

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

  type FeatureKey =
    | 'parking'
    | 'balcony'
    | 'petFriendly'
    | 'internet'
    | 'waterIncluded'
    | 'gasIncluded'
    | 'furnished'
    | 'cableTV'
    | 'storage'

  const featureFlags: { key: FeatureKey; label: string; icon: ReactNode }[] = [
    { key: 'parking', label: 'Parqueadero', icon: <ParkingSquare className="w-5 h-5" /> },
    { key: 'balcony', label: 'Balcón', icon: <Sun className="w-5 h-5" /> },
    { key: 'petFriendly', label: 'Pet friendly', icon: <PawPrint className="w-5 h-5" /> },
    { key: 'internet', label: 'WiFi incluido', icon: <Wifi className="w-5 h-5" /> },
    { key: 'waterIncluded', label: 'Agua incluida', icon: <BathIcon className="w-5 h-5" /> },
    { key: 'gasIncluded', label: 'Gas incluido', icon: <Flame className="w-5 h-5" /> },
    { key: 'furnished', label: 'Amoblado', icon: <Home className="w-5 h-5" /> },
    { key: 'cableTV', label: 'TV por cable', icon: <Tv className="w-5 h-5" /> },
    { key: 'storage', label: 'Depósito/Bodega', icon: <Package className="w-5 h-5" /> },
  ]

  const visibleFeatures = featureFlags.filter(({ key }) => Boolean((unit as Record<string, unknown>)[key]))
  const highlights = normalizeHighlights((unit as Record<string, unknown>).highlights, unit.property.name)
  const isAuthenticated = Boolean(session?.user)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-amber-500">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <Star className="w-4 h-4 text-amber-400" />
            <span className="ml-1 text-amber-600 font-semibold">4.0</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {unit.property.name} — Unidad {unit.unitNumber}
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4" />
            <span>
              {unit.property.street} {unit.property.number}, {unit.property.city}, {unit.property.country}
            </span>
            <span className="text-blue-600 font-semibold">• Excelente ubicación</span>
          </div>
        </div>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Gallery images={safeImages} propertyName={unit.property.name} />

          <aside className="space-y-4">
            <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reseñas</p>
                  <p className="text-xl font-semibold text-gray-900">Fabuloso</p>
                  <p className="text-xs text-gray-500">2,760 reseñas</p>
                </div>
                <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-lg font-semibold">8.7</div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-800 font-medium mb-2">Lo que más gustó</p>
                <p className="text-sm text-gray-600">
                  “Ubicación, limpieza, buen tamaño de habitaciones, excelente edificio.”
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1 rounded-md">
                  Precio
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(unit.baseRent)}</p>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-700">
                <span className="flex items-center space-x-1">
                  <Bed className="w-4 h-4" />
                  <span>{unit.bedrooms} hab</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Bath className="w-4 h-4" />
                  <span>{unit.bathrooms} baños</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Maximize className="w-4 h-4" />
                  <span>{formatArea(unit.area)}</span>
                </span>
              </div>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                  <Heart className="w-5 h-5 text-gray-700" />
                </button>
                <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer">
                  <Share2 className="w-5 h-5 text-gray-700" />
                </button>
              </div>
              <ReservationActions isAuthenticated={isAuthenticated} unitId={unit.id} />
            </div>
          </aside>
        </section>

        <section className="border border-gray-200 rounded-xl p-5 space-y-3" id="caracteristicas">
          <h2 className="text-lg font-semibold text-gray-900">Características</h2>
          <div className="flex flex-wrap gap-3 text-sm text-gray-700">
            <span className="px-3 py-1 rounded-full bg-gray-100">
              {unit.furnished ? 'Amoblado' : 'Sin amoblar'}
            </span>
            {unit.petFriendly && <span className="px-3 py-1 rounded-full bg-gray-100">Pet friendly</span>}
            {unit.parking && <span className="px-3 py-1 rounded-full bg-gray-100">Parqueadero</span>}
            {unit.balcony && <span className="px-3 py-1 rounded-full bg-gray-100">Balcón</span>}
            {unit.internet && <span className="px-3 py-1 rounded-full bg-gray-100">Internet incluido</span>}
            {unit.gasIncluded && <span className="px-3 py-1 rounded-full bg-gray-100">Gas incluido</span>}
            {unit.waterIncluded && <span className="px-3 py-1 rounded-full bg-gray-100">Agua incluida</span>}
          </div>
          {unit.description && <p className="text-sm text-gray-700 leading-6">{unit.description}</p>}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Servicios populares</h2>
          {visibleFeatures.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleFeatures.map((f) => (
                <FeaturePill key={f.key} icon={f.icon} label={f.label} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay servicios destacados para esta unidad.</p>
          )}
        </section>

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
                    <p className="flex items-start space-x-2">
                      <ParkingSquare className="w-4 h-4 mt-0.5" />
                      <span>Parqueadero disponible</span>
                    </p>
                  )}
                  {unit.internet && (
                    <p className="flex items-start space-x-2">
                      <Wifi className="w-4 h-4 mt-0.5" />
                      <span>Internet incluido</span>
                    </p>
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
      </main>
      <Footer />
    </div>
  )
}

function FeaturePill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center space-x-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
      <div className="text-gray-700">{icon}</div>
      <span className="text-sm text-gray-800 font-medium">{label}</span>
    </div>
  )
}
