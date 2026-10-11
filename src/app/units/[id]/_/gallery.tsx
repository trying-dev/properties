'use client'

import Image from 'next/image'
import { useState } from 'react'
import { MiniMap, parseGpsCoordinates } from '+/components/Map'

interface Props {
  images: string[]
  propertyName: string
  gpsCoordinates?: string | null
  address?: string
}

export default function Gallery({ images, propertyName, gpsCoordinates, address }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const selectImage = (idx: number) => {
    setSelectedIdx(idx)
    setShowMap(false)
  }
  const safeImages = images.length ? images : ['/placeholder-apartment.jpg']

  const main = safeImages[selectedIdx] || '/placeholder-apartment.jpg'
  const rightTop = safeImages[(selectedIdx + 1) % safeImages.length] || '/placeholder-apartment.jpg'
  const rightBottom = safeImages[(selectedIdx + 2) % safeImages.length] || '/placeholder-apartment.jpg'
  const hasMap = parseGpsCoordinates(gpsCoordinates) !== null
  const thumbs = safeImages.filter((_, idx) => idx !== selectedIdx).slice(0, 5)
  const extraCount = Math.max(0, safeImages.length - (1 + 2 + thumbs.length))

  return (
    <div className="lg:col-span-2 space-y-3">
      <div className="grid grid-cols-3 grid-rows-2 gap-3">
        {hasMap && showMap ? (
          <div className="col-span-2 row-span-2 relative z-0 overflow-hidden rounded-xl aspect-4/3 border border-gray-200 bg-gray-50">
            <MiniMap gpsCoordinates={gpsCoordinates} label={address ?? propertyName} zoom={16} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => selectImage(selectedIdx)}
            className="col-span-2 row-span-2 relative overflow-hidden rounded-xl aspect-4/3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <Image src={main} alt={propertyName} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-cover" priority />
          </button>
        )}
        <button
          type="button"
          onClick={() => selectImage((selectedIdx + 1) % safeImages.length)}
          className="relative overflow-hidden rounded-xl aspect-4/3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <Image src={rightTop} alt={`${propertyName} vista 2`} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
        </button>
        {hasMap && showMap ? (
          <button
            type="button"
            onClick={() => setShowMap(false)}
            className="relative overflow-hidden rounded-xl aspect-4/3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <Image src={main} alt={`${propertyName} foto principal`} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
            <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">Ver fotos</span>
          </button>
        ) : hasMap ? (
          <button
            type="button"
            onClick={() => setShowMap(true)}
            aria-label="Ver mapa de la ubicación"
            className="relative z-0 overflow-hidden rounded-xl aspect-4/3 border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <MiniMap gpsCoordinates={gpsCoordinates} label={address ?? propertyName} interactive={false} zoom={14} />
            <span className="absolute inset-0 z-[1000]" />
            <span className="absolute bottom-2 left-2 z-[1001] rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium text-white">Ver mapa</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => selectImage((selectedIdx + 2) % safeImages.length)}
            className="relative overflow-hidden rounded-xl aspect-4/3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <Image src={rightBottom} alt={`${propertyName} vista 3`} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
          </button>
        )}
      </div>

      {thumbs.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {thumbs.map((img, idx) => {
            const originalIdx = safeImages.findIndex((v) => v === img)
            const isLast = idx === thumbs.length - 1 && extraCount > 0
            return (
              <button
                type="button"
                key={`${img}-${idx}`}
                onClick={() => selectImage(originalIdx >= 0 ? originalIdx : 0)}
                className="relative overflow-hidden rounded-xl aspect-4/3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <Image src={img} alt={`${propertyName} thumb ${idx + 4}`} fill sizes="(max-width: 1024px) 33vw, 20vw" className="object-cover" />
                {isLast && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-base">+{extraCount} fotos</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
