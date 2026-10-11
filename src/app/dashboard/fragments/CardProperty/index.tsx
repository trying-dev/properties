import Image from 'next/image'
import { Property } from '+/generated/prisma/client'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { parseImages } from '+/app/units/[id]/_/utils'

export default function CardProperty({ property }: { property: Property }) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const { name = 'Nombre de Propiedad', street = 'Calle', number = '000', neighborhood = 'Colonia' } = property

  const fullAddress = [[street, number].filter((part) => part && part !== '???').join(' '), neighborhood].filter(Boolean).join(', ') || 'Sin dirección'
  const cover = parseImages(property.images)[0] ?? '/images/img1.png'



  const handleCardClick = () => {
    router.push(`/dashboard/admin/properties/${property.id}`)
  }


  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div
        className={`
        grid grid-cols-1 md:grid-cols-[2fr_2fr] items-center gap-3 px-4 py-3 transition-colors duration-150
        ${isHovered ? 'bg-gray-50' : ''}
      `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={cover}
                alt={`Imagen de ${name}`}
                width={48}
                height={48}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{name}</h3>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 min-w-0">
          <MapPin className="h-4 w-4 mr-1 text-gray-400 shrink-0" />
          <span className="truncate">{fullAddress}</span>
        </div>
      </div>
    </div>
  )
}
