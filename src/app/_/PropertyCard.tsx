'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AvailableUnit } from '+/actions/nuevo-proceso'
import Modal from '+/components/Modal'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'

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
  isAuthenticated?: boolean
  role?: 'admin' | 'tenant' | null
  isFavorite?: boolean
  isFavoritesLoading?: boolean
  onToggleFavorite?: (unitId: string) => Promise<void> | void
}

export default function PropertyCard({
  unit,
  index,
  isAuthenticated = false,
  role = null,
  isFavorite = false,
  isFavoritesLoading = false,
  onToggleFavorite,
}: PropertyCardProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSavingFavorite, setIsSavingFavorite] = useState(false)
  const pendingFavoriteRef = useRef(false)
  const images = parseImages(unit.images)
  const currentImage = images[activeImage] || '/placeholder-apartment.jpg'

  const priceLabel = unit.baseRent ? `${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(unit.baseRent)}` : 'Consultar'
  const areaLabel = unit.area ? `${unit.area} m²` : 'N/D'
  const bedroomsLabel = unit.bedrooms ? `${unit.bedrooms} Zi.` : 'N/D'
  const hasMultipleImages = images.length > 1

  const handlePrevImage = (event: ButtonMouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNextImage = (event: ButtonMouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setActiveImage((prev) => (prev + 1) % images.length)
  }

  const handleFavoriteClick = (event: ButtonMouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!isAuthenticated) {
      pendingFavoriteRef.current = true
      setIsAuthModalOpen(true)
      return
    }
    if (role !== 'tenant') return
    if (!onToggleFavorite || isSavingFavorite || isFavoritesLoading) return
    setIsSavingFavorite(true)
    Promise.resolve(onToggleFavorite(unit.id)).finally(() => {
      setIsSavingFavorite(false)
    })
  }

  const handleSelectImage = (idx: number) => (event: ButtonMouseEvent) => {
    event.preventDefault()
    setActiveImage(idx)
  }

  useEffect(() => {
    if (!isAuthenticated || !pendingFavoriteRef.current) return
    pendingFavoriteRef.current = false
    if (role !== 'tenant') return
    if (!onToggleFavorite) return
    void Promise.resolve(onToggleFavorite(unit.id))
  }, [isAuthenticated, onToggleFavorite, role, unit.id])

  const heartClassName = isFavorite ? 'text-gray-800 fill-gray-800' : 'text-gray-600 fill-transparent group-hover:fill-gray-700'
  const heartButtonClassName =
    'group absolute bottom-3 right-3 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-sm transition cursor-pointer disabled:opacity-60'

  return (
    <>
      <Link
        key={unit.id}
        href={`/units/${unit.id}`}
        className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
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

          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur text-gray-700 shadow hover:bg-white transition cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 backdrop-blur text-gray-700 shadow hover:bg-white transition cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 mx-auto" />
              </button>
            </>
          )}

          <button
            onClick={handleFavoriteClick}
            disabled={isSavingFavorite || isFavoritesLoading}
            aria-pressed={isFavorite}
            className={heartButtonClassName}
          >
            <Heart className={`h-5 w-5 transition duration-300 ${heartClassName}`} />
          </button>

          {hasMultipleImages && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={handleSelectImage(idx)}
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

      <Modal
        isOpen={isAuthModalOpen && !isAuthenticated}
        onClose={() => setIsAuthModalOpen(false)}
        ariaLabel="Inicia sesión para guardar favoritos"
        className="max-w-lg"
      >
        <AuthFormsPanel />
      </Modal>
    </>
  )
}
