'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import Modal from '+/components/Modal'
import { useDispatch, useSelector } from '+/redux'
import { setAuthStatus, setAuthVerificationExpires } from '+/redux/slices/auth'
import { setProcessState } from '+/redux/slices/process'

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
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const baseButtonClass =
    'w-full inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition'
  const buttonClass = buttonClassName || baseButtonClass

  const handleGoToApplication = () => {
    dispatch(setProcessState({ unitId }))
    router.push('/aplication')
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
  const router = useRouter()
  const dispatch = useDispatch()
  const authStatus = useSelector((state) => state.auth.status)

  useEffect(() => {
    if (!isOpen || authStatus !== 'success') return
    onClose()
    dispatch(setProcessState({ unitId }))
    router.push('/aplication')
    dispatch(setAuthStatus('idle'))
    dispatch(setAuthVerificationExpires(null))
  }, [authStatus, dispatch, isOpen, onClose, router, unitId])

  const handleClose = () => {
    if (authStatus === 'verify') return
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Reserva sin iniciar sesión"
      className="max-w-2xl"
      disableClose={authStatus === 'verify'}
    >
      <AuthFormsPanel />
    </Modal>
  )
}
