'use client'

import { CheckCircle2 } from 'lucide-react'

import { profiles } from '../_/profiles'
import { ApplicantInfo, ProfileId } from '../_/types'

type SummarySidebarProps = {
  activeStep: number
  selectedProfile: ProfileId | ''
  applicantInfo: ApplicantInfo
}

const SummarySidebar = ({ activeStep, selectedProfile, applicantInfo }: SummarySidebarProps) => {
  if (activeStep <= 1) return null

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <CheckCircle2 size={20} />
        Resumen de tu solicitud
      </h3>
      <div className="space-y-2 text-sm">
        {selectedProfile && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">{profiles[selectedProfile].emoji}</span>
            <div>
              <p className="font-medium text-gray-900">{profiles[selectedProfile].name}</p>
            </div>
          </div>
        )}
        {activeStep > 2 && applicantInfo.fullName && (
          <div className="pt-2 border-t border-blue-200">
            <p className="text-gray-700">
              <span className="font-medium">Solicitante:</span> {applicantInfo.fullName}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SummarySidebar
