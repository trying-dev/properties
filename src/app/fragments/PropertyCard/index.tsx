'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AvailableUnit } from '+/actions/nuevo-proceso'

function parseImages(images?: string | null): string[] {
  if (!images) return []
  try {
    return JSON.parse(images) as string[]
  } catch {
    return []
  }
}

interface PropertyCardProps {
  unit: AvailableUnit
  index: number
}

export default function PropertyCard({ unit, index }: PropertyCardProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const images = parseImages(unit.images)
  const currentImage = images[activeImage] || '/placeholder-apartment.jpg'

  const priceLabel = unit.baseRent ? `${new Intl.NumberFormat('de-DE').format(unit.baseRent)} €` : 'Consultar'
  const areaLabel = unit.area ? `${unit.area} m²` : 'N/D'
  const bedroomsLabel = unit.bedrooms ? `${unit.bedrooms} Zi.` : 'N/D'

  // Auto-advance carousel when not hovered
  useEffect(() => {
    if (images.length < 2) return
    const id = setInterval(() => {
      if (isHovered) return
      setActiveImage((prev) => (prev + 1) % images.length)
    }, 4000)
    return () => clearInterval(id)
  }, [images.length, isHovered])

  return (
    <Link
      key={unit.id}
      href={`/propiedades/${unit.id}`}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 bg-gray-100">
        <Image
          src={currentImage}
          alt={unit.property.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
          priority={index < 3}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImage((prev) => (prev - 1 + images.length) % images.length)
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur text-gray-700 shadow hover:bg-white transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 mx-auto" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveImage((prev) => (prev + 1) % images.length)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur text-gray-700 shadow hover:bg-white transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 mx-auto" />
            </button>
          </>
        )}

        <button
          onClick={(e) => {
            e.preventDefault()
          }}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-sm transition cursor-pointer"
        >
          <Heart className="h-5 w-5 text-gray-600" />
        </button>

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.preventDefault()
                  setActiveImage(idx)
                }}
                className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                  idx === activeImage ? 'bg-white shadow' : 'bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2">
          {unit.property.name} | {unit.property.neighborhood}
        </h3>
        <div className="flex items-center space-x-3 text-sm text-gray-800 font-semibold">
          <span>{priceLabel}</span>
          <span className="text-gray-400">•</span>
          <span>{areaLabel}</span>
          <span className="text-gray-400">•</span>
          <span>{bedroomsLabel}</span>
        </div>
        <p className="text-sm text-gray-600 flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {unit.property.street} {unit.property.number}, {unit.property.city}
        </p>
      </div>
    </Link>
  )
}
