'use client'

import { useEffect } from 'react'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import Modal from '+/components/Modal'
import { useDispatch, useSelector } from '+/redux'
import { setAuthModalOpen, setCodeVerificationState, setLoginState, setRegisterState } from '+/redux/slices/auth'

export default function AuthModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.auth.authModalOpen)
  const authTab = useSelector((state) => state.auth.authModalTab)
  const codeVerificationState = useSelector((state) => state.auth.codeVerificationState)

  const handleClose = () => {
    if (codeVerificationState === 'loading') return
    dispatch(setAuthModalOpen({ open: false }))
    dispatch(setLoginState('idle'))
    dispatch(setRegisterState('idle'))
    dispatch(setCodeVerificationState('idle'))
  }

  useEffect(() => {
    if (!isOpen) return
    if (authTab === 'login') {
      dispatch(setLoginState('start'))
    } else {
      dispatch(setRegisterState('start'))
    }
  }, [authTab, dispatch, isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      ariaLabel="Autenticación"
      className="max-w-4xl"
      disableClose={codeVerificationState === 'loading'}
    >
      <AuthFormsPanel />
    </Modal>
  )
}
