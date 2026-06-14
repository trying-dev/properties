import type { PropertyOccupancy } from '+/lib/occupancy'

type OccupancyBadgeProps = {
  status: PropertyOccupancy
  vacantUnits?: number
  totalUnits?: number
  className?: string
}

const config: Record<PropertyOccupancy, { label: string; dot: string; box: string }> = {
  VACANT: { label: 'Disponible', dot: 'bg-emerald-500', box: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  PARTIAL: { label: 'Parcial', dot: 'bg-amber-500', box: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  OCCUPIED: { label: 'Ocupada', dot: 'bg-gray-400', box: 'bg-gray-100 text-gray-600 ring-gray-500/20' },
  NONE: { label: 'Sin unidades', dot: 'bg-gray-300', box: 'bg-gray-50 text-gray-500 ring-gray-400/20' },
}

export default function OccupancyBadge({ status, vacantUnits, totalUnits, className = '' }: OccupancyBadgeProps) {
  const { label, dot, box } = config[status]

  const detail =
    status === 'PARTIAL' && vacantUnits != null && totalUnits != null
      ? ` · ${vacantUnits}/${totalUnits}`
      : status === 'VACANT' && vacantUnits != null && vacantUnits > 1
        ? ` · ${vacantUnits}`
        : ''

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${box} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
      {detail}
    </span>
  )
}
