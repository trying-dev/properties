'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import Modal from '+/components/Modal'
import { useDispatch, useSelector } from '+/redux'
import { setAuthStatus, setAuthVerificationExpires } from '+/redux/slices/auth'

type ReservationActionsProps = {
  isAuthenticated: boolean
  buttonClassName?: string
  buttonLabel?: string
}

export default function ReservationActions({
  isAuthenticated,
  buttonClassName,
  buttonLabel = 'Reservar',
}: ReservationActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const baseButtonClass =
    'w-full inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition'
  const buttonClass = buttonClassName || baseButtonClass

  if (isAuthenticated) {
    return (
      <Link href="/aplication" className={buttonClass}>
        {buttonLabel}
      </Link>
    )
  }

  return (
    <>
      <button type="button" onClick={() => setIsModalOpen(true)} className={buttonClass}>
        {buttonLabel}
      </button>
      <ReservationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

type ReservationModalProps = {
  isOpen: boolean
  onClose: () => void
}

function ReservationModal({ isOpen, onClose }: ReservationModalProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const authStatus = useSelector((state) => state.auth.status)

  useEffect(() => {
    if (!isOpen || authStatus !== 'success') return
    onClose()
    router.push('/aplication')
    dispatch(setAuthStatus('idle'))
    dispatch(setAuthVerificationExpires(null))
  }, [authStatus, dispatch, isOpen, onClose, router])

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
