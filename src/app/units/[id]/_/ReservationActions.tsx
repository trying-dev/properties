'use client'

import { useEffect, useState } from 'react'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import Modal from '+/components/Modal'
import { useDispatch, useSelector } from '+/redux'
import { setAuthVerificationExpires, setCodeVerificationState } from '+/redux/slices/auth'
import { initProcess } from '+/redux/slices/process'
import { useAppRouter } from '+/hooks/useAppRouter'

type ReservationActionsProps = {
  isAuthenticated: boolean
  unitId: string
  buttonClassName?: string
  buttonLabel?: string
}

export default function ReservationActions({
  isAuthenticated,
  unitId,
  buttonClassName,
  buttonLabel = 'Reservar',
}: ReservationActionsProps) {
  const dispatch = useDispatch()
  const push = useAppRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const baseButtonClass =
    'w-full inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition'
  const buttonClass = buttonClassName || baseButtonClass

  const handleGoToApplication = () => {
    dispatch(initProcess({ unitId }))
    push('/aplication')
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
      {isModalOpen && (
        <ReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} unitId={unitId} />
      )}
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

  useEffect(() => {
    if (!isOpen) return
    if (!isAuthenticated) return
    if (!tenantId) return

    console.log({ isOpen, isAuthenticated, tenantId })

    onClose()
    dispatch(initProcess({ unitId }))
    push('/aplication')
    dispatch(setAuthVerificationExpires(null))
  }, [dispatch, isAuthenticated, isOpen, onClose, push, tenantId, unitId])

  const handleClose = () => {
    if (codeVerificationState === 'loading') return
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Reserva sin iniciar sesión"
      className="max-w-2xl"
      disableClose={codeVerificationState === 'loading'}
    >
      <AuthFormsPanel />
    </Modal>
  )
}
