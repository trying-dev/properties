'use client'

import { useEffect } from 'react'

import { useDispatch, useSelector } from '+/redux'

import { setProcessState } from '+/redux/slices/process'

import { ProfileId } from './_/types'

import { useAppRouter } from '+/hooks/useAppRouter'

const ApplicationRootPage = () => {
  const dispatch = useDispatch()
  const push = useAppRouter()

  const unitId = useSelector((state) => state.process.unitId)
  const { id: tenantId, profile: tenantProfile } = useSelector((state) => state.user?.tenant) ?? {}

  useEffect(() => {
    if (!unitId || !tenantId) {
      console.error('No hay unitId o tenantId', { unitId, tenantId })
      return
    }

    if (tenantProfile) {
      dispatch(setProcessState({ tenantId, unitId, profile: tenantProfile as ProfileId, step: 2 }))
      push('/aplication/basicInformation')
    } else {
      dispatch(setProcessState({ tenantId, unitId }))
      push('/aplication/profile')
    }
  }, [dispatch, push, tenantId, tenantProfile, unitId])

  return null
}

export default ApplicationRootPage
