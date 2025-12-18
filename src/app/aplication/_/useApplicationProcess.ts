'use client'

import { useCallback, useEffect, useRef } from 'react'

import { useSearchParams } from 'next/navigation'

import { createProcessAction, getProcessAction, updateProcessAction } from '+/actions/processes'
import { useDispatch, useSelector } from '+/redux'
import { setApplicationState } from '+/redux/slices/application'
import { setProcessState } from '+/redux/slices/process'
import { useSession } from '+/hooks/useSession'

import { ApplicantInfo, ProfileId, profileIds } from './types'

const isProfileId = (value: unknown): value is ProfileId =>
  typeof value === 'string' && profileIds.includes(value as ProfileId)

type PersistProcessOptions = {
  payload: Record<string, unknown>
  step: number
  immediate?: boolean
}

const useApplicationProcess = (currentStep: number) => {
  const dispatch = useDispatch()
  const application = useSelector((state) => state.application)
  const processState = useSelector((state) => state.process)
  const { processId, tenantId, unitId } = processState
  const { session } = useSession()
  const searchParams = useSearchParams()
  const urlProcessId = searchParams?.get('processId')
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasHydratedProcess = useRef(false)

  const persistProcess = useCallback(
    async ({ payload, step, immediate = false }: PersistProcessOptions) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }

      const run = async () => {
        try {
          if (!processId) {
            const result = await createProcessAction({
              payload,
              currentStep: step,
              tenantId: tenantId ?? undefined,
              unitId: unitId ?? undefined,
            })
            if (result.success && result.data?.id) {
              dispatch(setProcessState({ processId: result.data.id }))
            }
          } else {
            await updateProcessAction({
              processId,
              payloadPatch: payload,
              currentStep: step,
              tenantId: tenantId ?? undefined,
              unitId: unitId ?? undefined,
            })
          }
        } catch (error) {
          console.error('Error al guardar el proceso:', error)
        }
      }

      if (immediate) {
        run()
      } else {
        saveTimeout.current = setTimeout(run, 800)
      }
    },
    [dispatch, processId, tenantId, unitId]
  )

  useEffect(() => {
    if (application.activeStep === currentStep) return
    dispatch(setApplicationState({ activeStep: currentStep }))
  }, [application.activeStep, currentStep, dispatch])

  useEffect(() => {
    if (application.selectedProfile || !session?.user) return
    const rawProfile =
      (session.user as { applicationProfile?: unknown }).applicationProfile ??
      (session.user as { profile?: unknown }).profile

    if (!isProfileId(rawProfile)) return

    const documentType = rawProfile === 'foreignLocal' || rawProfile === 'nomad' ? 'pasaporte' : 'cedula'
    dispatch(
      setApplicationState({
        selectedProfile: rawProfile,
        applicantInfo: { ...application.applicantInfo, documentType },
      })
    )
  }, [application.applicantInfo, application.selectedProfile, dispatch, session?.user])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedProcess = localStorage.getItem('applicationProcessId')
    const storedTenant =
      localStorage.getItem('selectedTenantId') || localStorage.getItem('np:selectedTenantId')
    const storedUnit = localStorage.getItem('np:selectedUnitId')

    const patch: Record<string, string> = {}
    if (storedProcess) patch.processId = storedProcess
    if (storedTenant) patch.tenantId = storedTenant
    if (storedUnit) patch.unitId = storedUnit

    if (Object.keys(patch).length) {
      dispatch(setProcessState(patch))
    }
  }, [dispatch])

  useEffect(() => {
    if (tenantId || !session?.user?.id || session.user.role !== 'tenant') return
    dispatch(setProcessState({ tenantId: session.user.id }))
  }, [dispatch, session?.user?.id, session?.user?.role, tenantId])

  useEffect(() => {
    if (!urlProcessId || processId === urlProcessId) return
    dispatch(setProcessState({ processId: urlProcessId }))
  }, [dispatch, processId, urlProcessId])

  useEffect(() => {
    const pid = urlProcessId || processId
    if (!pid || hasHydratedProcess.current) return

    const loadProcess = async () => {
      try {
        const result = await getProcessAction(pid)
        if (!result.success || !result.data) return

        const {
          payload,
          currentStep: storedStep,
          tenantId: storedTenantId,
          unitId: storedUnitId,
        } = result.data
        const payloadData = (payload as Record<string, unknown>) ?? {}

        if (storedTenantId) dispatch(setProcessState({ tenantId: storedTenantId }))
        if (storedUnitId) dispatch(setProcessState({ unitId: storedUnitId }))

        dispatch(
          setApplicationState({
            selectedProfile: (payloadData.selectedProfile as ProfileId) ?? application.selectedProfile,
            selectedSecurity: (payloadData.selectedSecurity as string) ?? application.selectedSecurity ?? '',
            acceptedDeposit:
              payloadData.acceptedDeposit !== undefined
                ? Boolean(payloadData.acceptedDeposit)
                : application.acceptedDeposit,
            applicantInfo: {
              ...application.applicantInfo,
              ...(payloadData.applicantInfo as ApplicantInfo),
            },
            activeStep:
              (payloadData.activeStep as number | undefined) ?? storedStep ?? application.activeStep,
          })
        )

        hasHydratedProcess.current = true
      } catch (error) {
        console.error('Error al cargar el proceso:', error)
      }
    }

    loadProcess()
  }, [
    application.acceptedDeposit,
    application.activeStep,
    application.applicantInfo,
    application.selectedProfile,
    application.selectedSecurity,
    dispatch,
    processId,
    urlProcessId,
  ])

  useEffect(() => {
    const payload = {
      applicantInfo: application.applicantInfo,
      selectedProfile: application.selectedProfile,
      selectedSecurity: application.selectedSecurity,
      acceptedDeposit: application.acceptedDeposit,
      activeStep: application.activeStep,
    }
    const hasData =
      application.applicantInfo.fullName ||
      application.applicantInfo.email ||
      application.applicantInfo.phone ||
      application.applicantInfo.documentNumber ||
      application.selectedProfile

    if (!hasData) return

    persistProcess({ payload, step: application.activeStep })
  }, [
    application.acceptedDeposit,
    application.activeStep,
    application.applicantInfo,
    application.selectedProfile,
    application.selectedSecurity,
    persistProcess,
  ])

  useEffect(
    () => () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
    },
    []
  )

  return { application, processState, persistProcess }
}

export default useApplicationProcess
