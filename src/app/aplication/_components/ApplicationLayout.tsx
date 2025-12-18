'use client'

import { ReactNode } from 'react'

import Header from '+/components/Header'
import Footer from '+/components/Footer'
import { useSelector } from '+/redux'

import StepProgress from './StepProgress'
import SummarySidebar from './SummarySidebar'
import { profiles } from '../_/profiles'
import { ProfileId } from '../_/types'

type ApplicationLayoutProps = {
  currentStep: number
  children: ReactNode
}

const ApplicationLayout = ({ currentStep, children }: ApplicationLayoutProps) => {
  const { selectedProfile, applicantInfo } = useSelector((state) => state.application)
  const selectedProfileTyped = (selectedProfile in profiles ? selectedProfile : '') as ProfileId | ''

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8 px-4">
      <Header />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitud de Arrendamiento</h1>
          <p className="text-gray-600">Completa los siguientes pasos para enviar tu solicitud</p>
        </div>

        <StepProgress activeStep={currentStep} />

        <SummarySidebar
          activeStep={currentStep}
          selectedProfile={selectedProfileTyped}
          applicantInfo={applicantInfo}
        />

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">{children}</div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <Footer />
    </div>
  )
}

export default ApplicationLayout
