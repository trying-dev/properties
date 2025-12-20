'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname } from 'next/navigation'

import Header from '+/components/Header'
import Footer from '+/components/Footer'

import { useDispatch } from '+/redux'
import { setProcessState } from '+/redux/slices/process'
import StepProgress from './StepProgress'
import SummarySidebar from './SummarySidebar'

const routeStepMap: Record<string, number> = {
  '/aplication/profile': 1,
  '/aplication/basicInformation': 2,
  '/aplication/complementInfo': 3,
  '/aplication/security': 4,
}

const ApplicationLayout = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch()
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) return
    const step = routeStepMap[pathname]
    if (!step) return
    dispatch(setProcessState({ step }))
  }, [dispatch, pathname])

  return (
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
}

export default ApplicationLayout
