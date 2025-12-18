'use client'

import { useRouter } from 'next/navigation'

import ApplicationLayout from '../_components/ApplicationLayout'
import StepSelectProfile from '../_components/StepSelectProfile'
import useApplicationProcess from '../_/useApplicationProcess'
import { profiles } from '../_/profiles'
import { ApplicantInfo, ProfileId } from '../_/types'

import { useDispatch } from '+/redux'
import { setApplicationState } from '+/redux/slices/application'

const ProfileStepPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { application, processState, persistProcess } = useApplicationProcess(1)
  const { applicantInfo } = application
  const selectedProfile = application.selectedProfile as ProfileId | ''

  const handleSelectProfile = (profileId: ProfileId) => {
    if (!profiles[profileId]) return
    const updatedApplicantInfo: ApplicantInfo = {
      ...applicantInfo,
      documentType: profileId === 'foreignLocal' || profileId === 'nomad' ? 'pasaporte' : 'cedula',
      documentNumber: '',
    }

    dispatch(
      setApplicationState({
        selectedProfile: profileId,
        selectedSecurity: '',
        acceptedDeposit: false,
        applicantInfo: updatedApplicantInfo,
        uploadedDocs: {},
      })
    )

    const payload = {
      applicantInfo: updatedApplicantInfo,
      selectedProfile: profileId,
      selectedSecurity: '',
      acceptedDeposit: false,
      activeStep: 2,
      tenantId: processState.tenantId,
      unitId: processState.unitId,
    }

    persistProcess({ payload, step: 2, immediate: true })
    router.push('/aplication/information')
  }

  return (
    <ApplicationLayout currentStep={1}>
      <StepSelectProfile selectedProfile={selectedProfile} onSelectProfile={handleSelectProfile} />
    </ApplicationLayout>
  )
}

export default ProfileStepPage
