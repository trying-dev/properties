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
        grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_160px] items-center gap-3 rounded-lg border px-4 py-3 transition-all duration-200
        ${isHovered ? 'border-blue-300 shadow-sm bg-blue-50/50' : 'border-gray-200 hover:border-gray-300'}
      `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src="/images/img1.png"
                alt={`Imagen de ${name}`}
                width={48}
                height={48}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{name}</h3>
            <p className="text-xs text-gray-500 truncate">ID: {property.id.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-600 min-w-0">
          <MapPin className="h-4 w-4 mr-1 text-gray-400 shrink-0" />
          <span className="truncate">{fullAddress}</span>
        </div>

        <div>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Activa</span>
        </div>

        <div className="text-xs text-gray-500">Ver detalle</div>
      </div>
    </div>
  )
}
