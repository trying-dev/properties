import type { ReactNode } from 'react'
import { Bath as BathIcon, Flame, Home, Package, ParkingSquare, PawPrint, Sun, Tv, Wifi } from 'lucide-react'
import type { UnitWithRelations } from '+/actions/nuevo-proceso'

type FeatureKey = 'parking' | 'balcony' | 'petFriendly' | 'internet' | 'waterIncluded' | 'gasIncluded' | 'furnished' | 'cableTV' | 'storage'

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

type PopularServicesProps = {
  unit: NonNullable<UnitWithRelations>
}

export default function PopularServices({ unit }: PopularServicesProps) {
  const visibleFeatures = featureFlags.filter(({ key }) => Boolean((unit as Record<string, unknown>)[key]))

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Servicios populares</h2>
      {visibleFeatures.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {visibleFeatures.map((feature) => (
            <FeaturePill key={feature.key} icon={feature.icon} label={feature.label} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No hay servicios destacados para esta unidad.</p>
      )}
    </section>
  )
}

function FeaturePill({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center space-x-3 border border-gray-200 rounded-xl px-4 py-3 bg-white">
      <div className="text-gray-700">{icon}</div>
      <span className="text-sm text-gray-800 font-medium">{label}</span>
    </div>
  )
}
