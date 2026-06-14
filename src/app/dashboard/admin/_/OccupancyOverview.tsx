'use client'

import { useEffect, useState } from 'react'
import { Building2, DoorOpen, DoorClosed, Clock } from 'lucide-react'
import { getOccupancySummaryAction, type OccupancySummary } from '+/actions/occupancy'

export default function OccupancyOverview() {
  const [summary, setSummary] = useState<OccupancySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const result = await getOccupancySummaryAction()
      if (mounted && result.success) setSummary(result.data ?? null)
      if (mounted) setIsLoading(false)
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const occupancyRate = summary && summary.totalUnits > 0 ? Math.round((summary.occupiedUnits / summary.totalUnits) * 100) : 0

  const cards = [
    {
      label: 'Unidades vacantes',
      value: summary?.vacantUnits ?? 0,
      hint: `${summary?.propertiesVacant ?? 0} propiedades libres`,
      icon: DoorOpen,
      accent: 'text-emerald-600',
    },
    {
      label: 'Unidades ocupadas',
      value: summary?.occupiedUnits ?? 0,
      hint: `${summary?.propertiesOccupied ?? 0} propiedades ocupadas`,
      icon: DoorClosed,
      accent: 'text-gray-700',
    },
    {
      label: 'Disponibilidad parcial',
      value: summary?.propertiesPartial ?? 0,
      hint: `${summary?.reservedUnits ?? 0} reservadas`,
      icon: Building2,
      accent: 'text-amber-600',
    },
    {
      label: 'Ocupación',
      value: `${occupancyRate}%`,
      hint: `${summary?.totalUnits ?? 0} unidades totales`,
      icon: Clock,
      accent: 'text-gray-700',
    },
  ]

  return (
    <div className="mb-12">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Ocupación del portafolio</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{card.label}</span>
              <card.icon className={`h-5 w-5 ${card.accent}`} strokeWidth={1.5} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{isLoading ? 'Cargando…' : card.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
