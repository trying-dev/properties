import { MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { parseImages } from '+/app/units/[id]/_/utils'
import type { Property } from '+/generated/prisma/client'

export default function CardPropertyGrid({ property }: { property: Property }) {
  const cover = parseImages(property.images)[0] ?? '/images/img1.png'
  const address = [`${property.street} ${property.number}`.trim(), property.neighborhood].filter(Boolean).join(', ')

  return (
    <Link
      href={`/dashboard/admin/properties/${property.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-video bg-gray-100">
        <Image
          src={cover}
          alt={`Imagen de ${property.name}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="truncate font-semibold text-gray-900 group-hover:text-blue-700">{property.name}</h3>
        <p className="flex items-center text-sm text-gray-600">
          <MapPin className="mr-1 h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{address}</span>
        </p>
      </div>
    </Link>
  )
}
