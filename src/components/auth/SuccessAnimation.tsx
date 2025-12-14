'use client'

import { Check } from 'lucide-react'

export default function SuccessAnimation() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="w-24 h-24 bg-linear-to-r from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-3">¡Login Exitoso!</h3>
        <p className="text-gray-600 mb-8">Redirigiendo al dashboard...</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  )
}
