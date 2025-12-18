'use client'

import ApplicationLayout from '../_components/ApplicationLayout'
import StepSelectProfile from '../_components/StepSelectProfile'

const ProfileStepPage = () => {
  return (
    <ApplicationLayout currentStep={1}>
      <StepSelectProfile />
    </ApplicationLayout>
  )
}

export default ProfileStepPage
