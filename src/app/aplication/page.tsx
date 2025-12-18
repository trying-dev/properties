'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useDispatch, useSelector } from '+/redux'
import { setProcessState } from '+/redux/slices/process'

const ApplicationRootPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()

  const unitId = useSelector((state) => state.process.unitId)
  const { id: tenantId, applicationProfile } = useSelector((state) => state.user?.tenant) ?? {}

  useEffect(() => {
    if (!unitId || !tenantId) {
      console.error('No hay unitId o tenantId', { unitId, tenantId })
      return
    }

    if (applicationProfile) {
      dispatch(setProcessState({ tenantId, unitId, applicationProfile, step: 2 }))
      router.push('/aplication/information')
    } else {
      dispatch(setProcessState({ tenantId, unitId }))
      router.push('/aplication/information')
    }
  }, [applicationProfile, dispatch, router, tenantId, unitId])

  return null
}

export default ApplicationRootPage
