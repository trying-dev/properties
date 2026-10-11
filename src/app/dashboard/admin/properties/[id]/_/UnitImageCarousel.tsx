'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

type UnitImageCarouselProps = {
  images: string[]
  alt: string
}

export default function UnitImageCarousel({ images, alt }: UnitImageCarouselProps) {
  const [index, setIndex] = useState(0)
  if (images.length === 0) return null

  const hasMany = images.length > 1
  const go = (step: number) => setIndex((current) => (current + step + images.length) % images.length)

  return (
    <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-gray-100">
      <Image src={images[index]} alt={`${alt} ${index + 1}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
      {hasMany && (
        <>
          <button
            type="button"
            aria-label="Imagen anterior"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-gray-900 shadow hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Imagen siguiente"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 text-gray-900 shadow hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {images.map((_, dot) => (
              <button
                key={dot}
                type="button"
                aria-label={`Ir a la imagen ${dot + 1}`}
                onClick={() => setIndex(dot)}
                className={`h-1.5 w-1.5 rounded-full ${dot === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
