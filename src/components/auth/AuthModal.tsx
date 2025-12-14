'use client'

import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import Modal from '+/components/Modal'
import { useDispatch, useSelector } from '+/redux'
import { setAuthModalOpen } from '+/redux/slices/auth'

export default function AuthModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.auth.authModalOpen)
  const authStatus = useSelector((state) => state.auth.status)

  const handleClose = () => {
    if (authStatus === 'verify') return
    dispatch(setAuthModalOpen({ open: false }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Autenticación"
      className="max-w-4xl"
      disableClose={authStatus === 'verify'}
    >
      <AuthFormsPanel />
    </Modal>
  )
}
