'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import useApplicationProcess from './_/useApplicationProcess'

const ApplicationRootPage = () => {
  const router = useRouter()
  const { application } = useApplicationProcess(1)

  useEffect(() => {
    const { selectedProfile, selectedSecurity, activeStep } = application
    if (activeStep >= 3 || selectedSecurity) {
      router.replace('/aplication/security')
      return
    }
    if (selectedProfile) {
      router.replace('/aplication/information')
      return
    }
    router.replace('/aplication/profile')
  }, [application.activeStep, application.selectedProfile, application.selectedSecurity, router])

  return null
}

export default ApplicationRootPage
