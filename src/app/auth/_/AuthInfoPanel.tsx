'use client'

import Image from 'next/image'

export default function AuthInfoPanel() {
  return (
    <div className="hidden lg:flex bg-linear-to-br from-teal-400 via-teal-500 to-cyan-500 p-16 flex-col justify-center items-center relative overflow-hidden">
      <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-300/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 text-center">
        <div className="mb-8">
          <div className="w-80 h-80 mx-auto relative rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="https://picsum.photos/id/64/800/800"
              alt="Community"
              className="w-full h-full object-cover"
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            />

            <div className="absolute inset-0 bg-linear-to-t from-teal-900/40 to-transparent"></div>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-white mb-4">
          Gestiona tu Comunidad
          <br />
          con Confianza
        </h2>
        <p className="text-teal-100 text-lg">
          Administra propiedades y pagos
          <br />
          desde un solo lugar de forma simple y segura
        </p>
      </div>
    </div>
  )
}
