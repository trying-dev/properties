'use client'

import { useEffect, useState } from 'react'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import Modal from '+/components/Modal'
import { useDispatch, useSelector } from '+/redux'
import { setAuthVerificationExpires } from '+/redux/slices/auth'
import { initProcess, setProcessState } from '+/redux/slices/process'
import { ProfileId } from '+/app/aplication/_/types'
import { useAppRouter } from '+/hooks/useAppRouter'

type ReservationActionsProps = {
  isAuthenticated: boolean
  unitId: string
  buttonClassName?: string
  buttonLabel?: string
}

export default function ReservationActions({ isAuthenticated, unitId, buttonClassName, buttonLabel = 'Reservar' }: ReservationActionsProps) {
  const dispatch = useDispatch()
  const push = useAppRouter()
  const tenantId = useSelector((state) => state.user?.tenant?.id)
  const tenantProfile = useSelector((state) => state.user?.tenant?.profile)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const baseButtonClass = 'w-full inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition'
  const buttonClass = buttonClassName || baseButtonClass

  const handleGoToApplication = () => {
    dispatch(initProcess({ unitId }))
    if (!tenantId) {
      push('/aplication')
      return
    }
    if (tenantProfile) {
      dispatch(
        setProcessState({
          tenantId,
          unitId,
          profile: tenantProfile as ProfileId,
          step: 2,
        })
      )
      push('/aplication/basicInformation')
      return
    }
    dispatch(setProcessState({ tenantId, unitId }))
    push('/aplication/profile')
  }

  if (isAuthenticated) {
    return (
      <button type="button" onClick={handleGoToApplication} className={buttonClass}>
        {buttonLabel}
      </button>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setIsModalOpen(true)} className={buttonClass}>
        {buttonLabel}
      </button>
      <ReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} unitId={unitId} />
    </>
  )
}

type ReservationModalProps = {
  isOpen: boolean
  onClose: () => void
  unitId: string
}

function ReservationModal({ isOpen, onClose, unitId }: ReservationModalProps) {
  const dispatch = useDispatch()
  const push = useAppRouter()
  const codeVerificationState = useSelector((state) => state.auth.codeVerificationState)
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const tenantId = useSelector((state) => state.user?.tenant?.id)
  const tenantProfile = useSelector((state) => state.user?.tenant?.profile)

  useEffect(() => {
    if (!isOpen) return
    if (!isAuthenticated) return
    if (!tenantId) return

    onClose()
    dispatch(initProcess({ unitId }))
    if (!tenantId) {
      push('/aplication')
      return
    }
    if (tenantProfile) {
      dispatch(
        setProcessState({
          tenantId,
          unitId,
          profile: tenantProfile as ProfileId,
          step: 2,
        })
      )
      push('/aplication/basicInformation')
      return
    }
    dispatch(setProcessState({ tenantId, unitId }))
    push('/aplication/profile')
    dispatch(setAuthVerificationExpires(null))
  }, [dispatch, isAuthenticated, isOpen, onClose, push, tenantId, tenantProfile, unitId])

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
