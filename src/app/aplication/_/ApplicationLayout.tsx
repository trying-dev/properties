'use client'

import { ReactNode } from 'react'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

import StepProgress from './StepProgress'
import SummarySidebar from './SummarySidebar'

const ApplicationLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8 px-4">
    <Header />

    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitud de Arrendamiento</h1>
        <p className="text-gray-600">Completa los siguientes pasos para enviar tu solicitud</p>
      </div>

      <StepProgress />

      <SummarySidebar />

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

export default ApplicationLayout
