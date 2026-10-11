import Image from 'next/image'
import Link from 'next/link'
import { UnitStatus } from '+/generated/prisma/enums'
import type { Property } from '+/generated/prisma/client'
import type { AdminUnitRow } from '+/actions/units'
import { parseImages } from '+/app/units/[id]/_/utils'

export const unitStatusLabel: Record<UnitStatus, string> = {
  VACANT: 'Vacante',
  OCCUPIED: 'Ocupada',
  RESERVED: 'Reservada',
  MAINTENANCE: 'Mantenimiento',
  UNAVAILABLE: 'No disponible',
}

const statusStyle: Record<UnitStatus, string> = {
  VACANT: 'bg-green-100 text-green-700',
  OCCUPIED: 'bg-gray-900 text-white',
  RESERVED: 'bg-amber-100 text-amber-700',
  MAINTENANCE: 'bg-orange-100 text-orange-700',
  UNAVAILABLE: 'bg-gray-100 text-gray-600',
}

const formatAddress = (property: Property) =>
  [[property.street, property.number].filter((part) => part && part !== '???').join(' '), property.neighborhood, property.city]
    .filter(Boolean)
    .join(', ')

const coverOf = (unit: AdminUnitRow) => parseImages(unit.images)[0] ?? '/images/img1.png'

const tenantNameOf = (unit: AdminUnitRow) => {
  const user = unit.contracts[0]?.tenant?.user
  return user ? `${user.name} ${user.lastName}` : null
}

const unitHref = (unit: AdminUnitRow) => `/dashboard/admin/units/${unit.id}`

export function UnitListRow({ unit }: { unit: AdminUnitRow }) {
  return (
    <div className="relative p-4 hover:bg-gray-50 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-[64px_120px_1fr_140px] gap-4 items-center">
        <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-gray-100">
          <Image src={coverOf(unit)} alt={`Unidad ${unit.unitNumber}`} fill sizes="64px" className="object-cover" />
        </div>
        <Link href={unitHref(unit)} className="text-sm font-semibold text-gray-900 hover:text-blue-700 after:absolute after:inset-0 after:content-['']">
          {unit.unitNumber}
        </Link>
        <div className="text-sm text-gray-600 min-w-0">
          <p className="font-medium text-gray-900 truncate">{unit.property.name}</p>
          <p className="text-xs text-gray-500 truncate">{formatAddress(unit.property)}</p>
        </div>
        <div>
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[unit.status]}`}>{unitStatusLabel[unit.status]}</span>
        </div>
      </div>
    </div>
  )
}

export function UnitMosaicCard({ unit }: { unit: AdminUnitRow }) {
  const tenantName = tenantNameOf(unit)

  return (
    <Link
      href={unitHref(unit)}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={coverOf(unit)}
          alt={`Unidad ${unit.unitNumber}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <span className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[unit.status]}`}>
          {unitStatusLabel[unit.status]}
        </span>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{unit.unitNumber}</h3>
        <p className="truncate text-sm text-gray-700">{unit.property.name}</p>
        <p className="truncate text-xs text-gray-500">{formatAddress(unit.property)}</p>
        {tenantName && <p className="truncate text-xs text-gray-500">Inquilino: {tenantName}</p>}
      </div>
    </Link>
  )
}

export function UnitCompactCard({ unit }: { unit: AdminUnitRow }) {
  return (
    <Link
      href={unitHref(unit)}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-4/3 bg-gray-100">
        <Image
          src={coverOf(unit)}
          alt={`Unidad ${unit.unitNumber}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <span className={`absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${statusStyle[unit.status]}`}>
          {unitStatusLabel[unit.status]}
        </span>
      </div>
      <div className="px-2.5 py-2">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{unit.unitNumber}</p>
        <p className="truncate text-xs text-gray-500">{unit.property.name}</p>
      </div>
    </Link>
  )
}
