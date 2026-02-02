import Image from 'next/image'
import { Property } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { useState } from 'react'

export default function CardProperty({ property }: { property: Property }) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const { name = 'Nombre de Propiedad', street = 'Calle', number = '000', neighborhood = 'Colonia' } = property

  const fullAddress = `${street} ${number}, ${neighborhood}`



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
        flex items-center gap-4 p-4 rounded-lg border transition-all duration-200
        ${isHovered ? 'border-blue-300 shadow-md bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}
      `}
      >
        {/* Property Image */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src="/images/img1.png"
              alt={`Imagen de ${name}`}
              width={64}
              height={64}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          {/* Status Badge */}
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        </div>

        {/* Property Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{name}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span className="truncate">{fullAddress}</span>
              </div>

              {/* Property Details */}
              <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-2 py-1 rounded-full">ID: {property.id.slice(0, 8)}...</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">Activa</span>
              </div>
            </div>

          </div>
        </div>

        {/* Hover Arrow */}
        <div
          className={`
          shrink-0 transition-all duration-200
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
        `}
        >
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
