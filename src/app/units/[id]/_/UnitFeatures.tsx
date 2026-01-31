import type { UnitWithRelations } from '+/actions/nuevo-proceso'

type UnitFeaturesProps = {
  unit: NonNullable<UnitWithRelations>
}

export default function UnitFeatures({ unit }: UnitFeaturesProps) {
  return (
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
  )
}
