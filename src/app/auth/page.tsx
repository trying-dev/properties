'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from '+/redux'
import { setAuthStatus } from '+/redux/slices/auth'

import AuthInfoPanel from '+/app/auth/_/AuthInfoPanel'
import AuthFormsPanel from '+/app/auth/_/AuthFormsPanel'
import ResetPasswordModal from '+/app/auth/_/ResetPasswordModal'
import SuccessAnimation from '+/app/auth/_/SuccessAnimation'

export default function AuthPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const authStatus = useSelector((state) => state.auth.status)

  useEffect(() => {
    if (authStatus !== 'success') return
    const timeout = setTimeout(() => {
      router.push('/dashboard')
      dispatch(setAuthStatus('idle'))
    }, 1500)

    return () => clearTimeout(timeout)
  }, [authStatus, dispatch, router])

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {authStatus === 'success' && <SuccessAnimation />}

      <ResetPasswordModal />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <AuthInfoPanel />

        <AuthFormsPanel />
      </div>
    </div>
  )
}
