import Image from 'next/image'
import Link from 'next/link'
import { parseImages } from '+/app/units/[id]/_/utils'
import type { Property } from '+/generated/prisma/client'

export default function CardPropertyCompact({ property }: { property: Property }) {
  const cover = parseImages(property.images)[0] ?? '/images/img1.png'

  return (
    <Link
      href={`/dashboard/admin/properties/${property.id}`}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-md"
    >
      <div className="relative aspect-4/3 bg-gray-100">
        <Image
          src={cover}
          alt={`Imagen de ${property.name}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <p className="truncate px-2.5 py-2 text-sm font-semibold text-gray-900 group-hover:text-blue-700">{property.name}</p>
    </Link>
  )
}
