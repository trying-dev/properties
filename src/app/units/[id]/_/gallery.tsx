'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
  images: string[]
  propertyName: string
}

export default function Gallery({ images, propertyName }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const safeImages = images.length ? images : ['/placeholder-apartment.jpg']

  const main = safeImages[selectedIdx] || '/placeholder-apartment.jpg'
  const rightTop = safeImages[(selectedIdx + 1) % safeImages.length] || '/placeholder-apartment.jpg'
  const rightBottom = safeImages[(selectedIdx + 2) % safeImages.length] || '/placeholder-apartment.jpg'
  const thumbs = safeImages.filter((_, idx) => idx !== selectedIdx).slice(0, 5)
  const extraCount = Math.max(0, safeImages.length - (1 + 2 + thumbs.length))

  return (
    <div className="lg:col-span-2 space-y-3">
      <div className="grid grid-cols-3 grid-rows-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedIdx(selectedIdx)}
          className="col-span-2 row-span-2 relative overflow-hidden rounded-xl aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <Image src={main} alt={propertyName} fill className="object-cover" priority />
        </button>
        <button
          type="button"
          onClick={() => setSelectedIdx((selectedIdx + 1) % safeImages.length)}
          className="relative overflow-hidden rounded-xl aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <Image src={rightTop} alt={`${propertyName} vista 2`} fill className="object-cover" />
        </button>
        <button
          type="button"
          onClick={() => setSelectedIdx((selectedIdx + 2) % safeImages.length)}
          className="relative overflow-hidden rounded-xl aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <Image src={rightBottom} alt={`${propertyName} vista 3`} fill className="object-cover" />
        </button>
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
                onClick={() => setSelectedIdx(originalIdx >= 0 ? originalIdx : 0)}
                className="relative overflow-hidden rounded-xl aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <Image src={img} alt={`${propertyName} thumb ${idx + 4}`} fill className="object-cover" />
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
