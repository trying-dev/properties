'use client'

import { useEffect, useState } from 'react'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import Modal from '+/components/Modal'
import { useDispatch, useSelector } from '+/redux'
import { setAuthVerificationExpires } from '+/redux/slices/auth'
import { initProcess, setProcessState } from '+/redux/slices/process'
import { ProfileId } from '+/app/process/_/types'
import { useAppRouter } from '+/hooks/useAppRouter'
import { getProcessByTenantUnitAction } from '+/actions/processes'

type ReservationActionsProps = {
  isAuthenticated: boolean
  unitId: string
  buttonClassName?: string
  buttonLabel?: string
}

const resolveNextRoute = (step: number | null, profile?: ProfileId | '') => {
  if (!profile) return '/process/profile'
  if (step && step >= 4) return '/process/security'
  if (step && step >= 3) return '/process/complementInfo'
  return '/process/basicInformation'
}

const canResumeFromStatus = (status?: string | null) => status === 'IN_PROGRESS' || status === 'WAITING_FOR_FEEDBACK'

export default function ReservationActions({ isAuthenticated, unitId, buttonClassName, buttonLabel = 'Reservar' }: ReservationActionsProps) {
  const dispatch = useDispatch()
  const push = useAppRouter()
  const tenantId = useSelector((state) => state.user?.tenant?.id)
  const tenantProfile = useSelector((state) => state.user?.tenant?.profile)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reservationError, setReservationError] = useState<string | null>(null)
  const [reservationNotice, setReservationNotice] = useState<string | null>(null)
  const [isReserving, setIsReserving] = useState(false)
  const [hasExistingProcess, setHasExistingProcess] = useState(false)
  const [isCheckingProcess, setIsCheckingProcess] = useState(false)
  const [existingProcessStatus, setExistingProcessStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !tenantId) {
      setHasExistingProcess(false)
      setExistingProcessStatus(null)
      return
    }

    let isMounted = true
    const checkExisting = async () => {
      setIsCheckingProcess(true)
      const result = await getProcessByTenantUnitAction(tenantId, unitId)
      if (isMounted) {
        const hasProcess = Boolean(result.success && result.data)
        setHasExistingProcess(hasProcess)
        setExistingProcessStatus(hasProcess ? result.data?.status ?? null : null)
        setIsCheckingProcess(false)
      }
    }

    void checkExisting()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, tenantId, unitId])

  const canResumeExisting = canResumeFromStatus(existingProcessStatus)
  const shouldShowExisting = isAuthenticated && Boolean(tenantId) && hasExistingProcess && canResumeExisting

  const baseButtonClass = 'w-full inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition'
  const buttonClass = buttonClassName || baseButtonClass

  const handleReservationFlow = async () => {
    setIsReserving(true)
    setReservationError(null)
    setReservationNotice(null)

    if (!tenantId) {
      push('/process')
      setIsReserving(false)
      return true
    }

    const existing = await getProcessByTenantUnitAction(tenantId, unitId)
    if (existing.success && existing.data) {
      if (!canResumeFromStatus(existing.data.status)) {
        setReservationNotice('Tu solicitud ya fue enviada y está en evaluación. Puedes ver el estado en tu dashboard.')
        setIsReserving(false)
        return true
      }
      const payload = (existing.data.payload ?? {}) as { profile?: ProfileId }
      const profile = payload.profile ?? (tenantProfile as ProfileId | undefined)
      const step = existing.data.currentStep ?? 1
      dispatch(
        setProcessState({
          processId: existing.data.id,
          tenantId: existing.data.tenantId ?? tenantId,
          unitId: existing.data.unitId ?? unitId,
          profile,
          step,
        })
      )
      push(resolveNextRoute(step, profile))
      setIsReserving(false)
      return true
    }

    if (!existing.success) {
      setReservationError(existing.error ?? 'No se pudo validar el proceso')
      setIsReserving(false)
      return false
    }

    dispatch(initProcess({ unitId }))
    if (tenantProfile) {
      dispatch(
        setProcessState({
          tenantId,
          unitId,
          profile: tenantProfile as ProfileId,
          step: 2,
        })
      )
      push('/process/basicInformation')
      setIsReserving(false)
      return true
    }
    dispatch(setProcessState({ tenantId, unitId }))
    push('/process/profile')
    setIsReserving(false)
    return true
  }

  if (isAuthenticated) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleReservationFlow}
          className={buttonClass}
          disabled={isReserving || (hasExistingProcess && !canResumeExisting)}
        >
          {isReserving ? 'Procesando...' : hasExistingProcess && !canResumeExisting ? 'Solicitud enviada' : shouldShowExisting ? 'Continuar proceso' : buttonLabel}
        </button>
        {isCheckingProcess && <p className="text-xs text-gray-500">Validando proceso...</p>}
        {reservationNotice && <p className="text-xs text-blue-600">{reservationNotice}</p>}
        {reservationError && <p className="text-xs text-red-600">{reservationError}</p>}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonClass} disabled={isReserving}>
          {isReserving ? 'Procesando...' : buttonLabel}
        </button>
        {reservationNotice && <p className="text-xs text-blue-600">{reservationNotice}</p>}
        {reservationError && <p className="text-xs text-red-600">{reservationError}</p>}
      </div>
      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        unitId={unitId}
        onAuthenticated={handleReservationFlow}
      />
    </>
  )
}

type ReservationModalProps = {
  isOpen: boolean
  onClose: () => void
  unitId: string
  onAuthenticated: () => Promise<boolean>
}

function ReservationModal({ isOpen, onClose, onAuthenticated }: ReservationModalProps) {
  const dispatch = useDispatch()
  const codeVerificationState = useSelector((state) => state.auth.codeVerificationState)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const tenantId = useSelector((state) => state.user?.tenant?.id)

  useEffect(() => {
    if (!isOpen) return
    if (!isAuthenticated) return
    if (!tenantId) return

    void onAuthenticated().then((success) => {
      if (success) onClose()
    })
    dispatch(setAuthVerificationExpires(null))
  }, [dispatch, isAuthenticated, isOpen, onClose, onAuthenticated, tenantId])

  const handleClose = () => {
    if (codeVerificationState === 'loading') return
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Reserva sin iniciar sesión"
      className="max-w-lg"
      disableClose={codeVerificationState === 'loading'}
    >
      <AuthFormsPanel />
    </Modal>
  )
}
