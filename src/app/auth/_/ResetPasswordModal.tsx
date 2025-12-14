'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Check, Mail, X } from 'lucide-react'
import { sendResetPasswordEmail } from '+/actions/auth/reset-password'
import { useDispatch, useSelector } from '+/redux'
import { setResetPasswordModalOpen } from '+/redux/slices/auth'
import Modal from '+/components/Modal'

export default function ResetPasswordModal() {
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.auth.resetPasswordModalOpen)

  const [resetEmail, setResetEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const closeModal = () => dispatch(setResetPasswordModalOpen(false))

  // Reset form when modal fully closes
  useEffect(() => {
    if (!isOpen) {
      const timeout = setTimeout(() => {
        setResetEmail('')
        setIsSubmitting(false)
        setIsSuccess(false)
        setError('')
      }, 300)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await sendResetPasswordEmail(resetEmail.trim())

      if (!response?.success) {
        setError(response?.message || 'Error al enviar el correo. Por favor intenta nuevamente.')
        setIsSubmitting(false)
        return
      }

      setIsSuccess(true)

      setTimeout(() => {
        closeModal()
      }, 3000)
    } catch {
      setError('Error al enviar el correo. Por favor intenta nuevamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} ariaLabel="Reset password" disableClose={isSubmitting}>
      {/* Header */}
      <div className="relative p-6 border-b border-gray-100">
        <button
          onClick={closeModal}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          disabled={isSubmitting}
        >
          <X className="w-6 h-6" />
        </button>
        <div className="pr-8">
          <h3 className="text-2xl font-bold text-gray-800">Reset Password</h3>
          <p className="text-gray-500 text-sm mt-2">
            Enter your email address and we{`'`}ll send you a link to reset your password
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="janedoe@mail.com"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <span>⚠</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !resetEmail}
              className="w-full bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          // Success State
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-800 mb-3">¡Email Enviado!</h4>
            <p className="text-gray-600 mb-2">Hemos enviado un enlace de recuperación a</p>
            <p className="text-teal-600 font-semibold mb-6">{resetEmail}</p>
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-teal-800">
                <strong>📧 Verifica tu email</strong>
                <br />
                Por favor revisa tu bandeja de entrada y sigue las instrucciones para resetear tu contraseña.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              ¿No lo ves? Revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!isSuccess && (
        <div className="px-6 pb-6">
          <div className="text-center text-sm text-gray-500">
            Remember your password?{' '}
            <button
              onClick={closeModal}
              className="text-teal-600 hover:text-teal-700 font-medium"
              disabled={isSubmitting}
            >
              Back to login
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
