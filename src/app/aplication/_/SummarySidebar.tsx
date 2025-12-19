'use client'

import { CheckCircle2 } from 'lucide-react'

import { useSelector } from '+/redux'

import { profiles } from './profiles'

const SummarySidebar = () => {
  const { step, profile, basicInfo } = useSelector((state) => state.process)

  if (step <= 1) return null

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <CheckCircle2 size={20} />
        Resumen de tu solicitud
      </h3>
      <div className="space-y-2 text-sm">
        {profile && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{profiles[profile].emoji}</span>
            <div>
              <p className="font-medium text-gray-900">{profiles[profile].name}</p>
            </div>
          </div>
        )}
        {step > 1 && (basicInfo.name || basicInfo.lastName) && (
          <div className="pt-2 border-t border-blue-200">
            <p className="text-gray-700">
              <span className="font-medium">Solicitante:</span>{' '}
              {[basicInfo.name, basicInfo.lastName].filter(Boolean).join(' ')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SummarySidebar
