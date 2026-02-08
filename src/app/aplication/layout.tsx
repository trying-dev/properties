'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

import { useDispatch } from '+/redux'
import { setProcessState } from '+/redux/slices/process'

import StepProgress from './_/StepProgress'
import SummarySidebar from './_/SummarySidebar'
import Header from '+/components/Header'
import Footer from '+/components/Footer'

type ApplicationLayoutProps = {
  children: ReactNode
}

const routeStepMap: Record<string, number> = {
  '/aplication/profile': 1,
  '/aplication/basicInformation': 2,
  '/aplication/complementInfo': 3,
  '/aplication/security': 4,
}

export default function ApplicationLayout({ children }: ApplicationLayoutProps) {
  const dispatch = useDispatch()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!pathname) return
    const step = routeStepMap[pathname]
    if (!step) return
    dispatch(setProcessState({ step }))
  }, [dispatch, pathname])

  if (!mounted) return null

  return (
    <div className="bg-white">
      <Header />

      <div className="max-w-5xl mx-auto py-8 px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Solicitud de Arrendamiento</h1>
          <p className="text-gray-600">Completa los siguientes pasos para enviar tu solicitud</p>
        </div>

        <StepProgress />

        <SummarySidebar />

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">{children}</div>
      </div>

      <Footer />
    </div>
  )
}
