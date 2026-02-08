'use client'

import { Suspense, useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { validateResetToken, resetPassword } from '+/actions/auth/reset-password'
import Link from 'next/link'

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
            <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800">Cargando...</h3>
            <p className="text-gray-500 mt-2">Preparando la página de reseteo</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isPending, startTransition] = useTransition()

  // Validation state
  const [isValidating, setIsValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')

  // Form state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Password validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  })

  // Validate token on mount
  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setTokenValid(false)
        setValidationMessage('Token no proporcionado')
        setIsValidating(false)
        return
      }

      try {
        const result = await validateResetToken(token)

        if (result.valid) {
          setTokenValid(true)
          setUserEmail(result.email || '')
        } else {
          setTokenValid(false)
          setValidationMessage(result.message || 'Token inválido')
        }
      } catch {
        setTokenValid(false)
        setValidationMessage('Error al validar el token')
      } finally {
        setIsValidating(false)
      }
    }

    validate()
  }, [token])

  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
    })
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validations
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (!Object.values(passwordStrength).every(Boolean)) {
      setError('La contraseña no cumple con los requisitos de seguridad')
      return
    }

    if (!token) {
      setError('Token no válido')
      return
    }

    startTransition(async () => {
      try {
        const result = await resetPassword(token, newPassword)

        if (result.success) {
          setIsSuccess(true)
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth')
          }, 3000)
        } else {
          setError(result.message || 'Error al resetear la contraseña')
        }
      } catch {
        setError('Error al procesar la solicitud. Por favor intenta nuevamente.')
      }
    })
  }

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-800">Validando token...</h3>
          <p className="text-gray-500 mt-2">Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Token Inválido</h3>
          <p className="text-gray-600 mb-8">{validationMessage}</p>
          <Link href="/auth" className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al login</span>
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
          <div className="w-24 h-24 bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-3">¡Contraseña Actualizada!</h3>
          <p className="text-gray-600 mb-8">
            Tu contraseña ha sido actualizada exitosamente.
            <br />
            Redirigiendo al login...
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-150"></div>
          </div>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-teal-500 to-cyan-500 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-teal-100">Create your new password</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
            <p className="text-sm text-teal-800">
              Resetting password for: <strong>{userEmail}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isPending}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordStrength.hasMinLength ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      {passwordStrength.hasMinLength && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-500'}>Al menos 8 caracteres</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordStrength.hasUpperCase ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      {passwordStrength.hasUpperCase && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={passwordStrength.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>Una letra mayúscula</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordStrength.hasLowerCase ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      {passwordStrength.hasLowerCase && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={passwordStrength.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>Una letra minúscula</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      {passwordStrength.hasNumber && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-500'}>Un número</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isPending}
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-red-500 text-sm flex items-center space-x-1">
                  <span>⚠</span>
                  <span>Las contraseñas no coinciden</span>
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isPending || !newPassword || !confirmPassword || newPassword !== confirmPassword || !Object.values(passwordStrength).every(Boolean)
              }
              className="w-full bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <Lock className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link href="/auth" className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium text-sm">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
