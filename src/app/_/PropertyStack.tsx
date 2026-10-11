'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, Layers, MapPin } from 'lucide-react'
import type { HomeUnit } from '+/actions/nuevo-proceso'
import type { PropertyWithOccupancy } from '+/actions/occupancy'

const PLACEHOLDER = '/placeholder-apartment.jpg'

function firstImage(images?: string | null): string {
  if (!images) return PLACEHOLDER
  try {
    return (JSON.parse(images) as string[])[0] || PLACEHOLDER
  } catch {
    return PLACEHOLDER
  }
}

const formatPrice = (rent?: number | null) =>
  rent ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(rent) : 'Consultar'

const unitDetail = (unit: HomeUnit) =>
  `${unit.area ? `${unit.area} m²` : 'N/D'} · ${unit.bedrooms ? `${unit.bedrooms} hab.` : 'N/D'}`

function minRent(units: HomeUnit[]) {
  const prices = units.map((u) => u.baseRent).filter((v): v is number => typeof v === 'number' && v > 0)
  return prices.length ? Math.min(...prices) : null
}

/** Listado de las unidades disponibles de una propiedad (se muestra al pasar el cursor o al tocar). */
function UnitsPanel({ units, propertyName }: { units: HomeUnit[]; propertyName: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-xl divide-y divide-gray-100 overflow-hidden max-h-80 overflow-y-auto">
      {units.map((unit) => (
        <Link key={unit.id} href={`/units/${unit.id}`} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors">
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image src={firstImage(unit.images)} alt={propertyName} fill sizes="64px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{formatPrice(unit.baseRent)}</p>
            <p className="text-xs text-gray-600">{unitDetail(unit)}</p>
          </div>
          <span className="shrink-0 text-xs font-medium text-gray-900 underline">Ver</span>
        </Link>
      ))}
    </div>
  )
}

type StackProps = {
  property: PropertyWithOccupancy
  units: HomeUnit[]
  variant: 'card' | 'row'
  compact?: boolean
}

/**
 * Propiedad con varias unidades disponibles, encapsulada en una sola tarjeta/fila.
 * Al pasar el cursor (o tocar en pantallas táctiles) despliega sus unidades.
 */
export default function PropertyStack({ property, units, variant, compact = false }: StackProps) {
  const [open, setOpen] = useState(false)
  const cover = firstImage(units[0]?.images)
  const from = minRent(units)
  const address = `${property.street} ${property.number}, ${property.city}`

  const handlers = {
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    },
  }

  const toggle = (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="absolute inset-0 z-[1] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
      aria-label={`Ver ${units.length} unidades de ${property.name}`}
    />
  )

  if (variant === 'row') {
    return (
      <div className="relative" {...handlers}>
        <div className="relative flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
          {toggle}
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image src={cover} alt={property.name} fill sizes="96px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {property.name} | {property.neighborhood}
            </p>
            <p className="flex items-center truncate text-xs text-gray-600">
              <MapPin className="mr-1 h-3.5 w-3.5 shrink-0" />
              {address}
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-gray-900">Desde {formatPrice(from)}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-900 px-2.5 py-1 text-xs font-medium text-white">
            <Layers className="h-3.5 w-3.5" />
            {units.length} unidades
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </span>
        </div>
        {open && (
          <div className="absolute right-4 top-full z-30 w-full max-w-md pt-1">
            <UnitsPanel units={units} propertyName={property.name} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" {...handlers}>
      <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
        {toggle}
        <div className={`relative bg-gray-100 ${compact ? 'h-36' : 'h-56'}`}>
          <Image
            src={cover}
            alt={property.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gray-900/85 px-2.5 py-1 text-xs font-medium text-white">
            <Layers className="h-3.5 w-3.5" />
            {units.length} unidades
          </span>
        </div>
        <div className={compact ? 'p-3 space-y-1' : 'p-4 space-y-2'}>
          <h3 className={`font-semibold text-gray-900 leading-tight line-clamp-2 ${compact ? 'text-sm' : 'text-base'}`}>
            {property.name} | {property.neighborhood}
          </h3>
          <p className={`font-semibold text-gray-800 ${compact ? 'text-xs' : 'text-sm'}`}>Desde {formatPrice(from)}</p>
          {!compact && (
            <p className="text-sm text-gray-600 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {address}
            </p>
          )}
        </div>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 pt-1">
          <UnitsPanel units={units} propertyName={property.name} />
        </div>
      )}
    </div>
  )
}

/** Fila de listado para una propiedad con una sola unidad disponible: va directo a la unidad. */
export function UnitRow({ property, unit }: { property: PropertyWithOccupancy; unit: HomeUnit }) {
  return (
    <Link href={`/units/${unit.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
      <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <Image src={firstImage(unit.images)} alt={property.name} fill sizes="96px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {property.name} | {property.neighborhood}
        </p>
        <p className="flex items-center truncate text-xs text-gray-600">
          <MapPin className="mr-1 h-3.5 w-3.5 shrink-0" />
          {property.street} {property.number}, {property.city}
        </p>
      </div>
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-gray-900">{formatPrice(unit.baseRent)}</p>
        <p className="text-xs text-gray-600">{unitDetail(unit)}</p>
      </div>
      <span className="shrink-0 text-xs font-medium text-gray-900 underline">Ver</span>
    </Link>
  )
}
