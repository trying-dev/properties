'use client'

import { Suspense, useState, useEffect, type KeyboardEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { completeUserRegistration, validateRegistrationToken, type TenantValidationRegistrationToken } from '+/actions/registro-con-token'

function RegisterWithTokenContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({ password: '', confirmPassword: '', agreeTerms: false })

  const [validationState, setValidationState] = useState({
    tokenValid: undefined as boolean | undefined,
    tokenChecking: true,
    tenant: undefined as TenantValidationRegistrationToken | undefined,
  })

  const [uiState, setUiState] = useState({
    showPassword: false,
    showConfirmPassword: false,
    isSubmitting: false,
    error: '',
    passwordStrength: 0,
  })

  useEffect(() => {
    if (!token) {
      setValidationState((prev) => ({ ...prev, tokenValid: false, tokenChecking: false }))
      return
    }

    ;(async () => {
      try {
        const response = await validateRegistrationToken(token)

        if (response.success) {
          setValidationState({
            tokenValid: true,
            tokenChecking: false,
            tenant: response.tenant,
          })
        } else {
          setValidationState((prev) => ({
            ...prev,
            tokenValid: false,
            tokenChecking: false,
          }))
        }
      } catch (error) {
        console.error('Error validating token:', error)
        setValidationState((prev) => ({
          ...prev,
          tokenValid: false,
          tokenChecking: false,
        }))
      }
    })()
  }, [token])

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    if (/[^A-Za-z0-9]/.test(password)) strength += 25
    return Math.min(strength, 100)
  }

  const handlePasswordChange = (password: string) => {
    setFormData((prev) => ({ ...prev, password }))
    setUiState((prev) => ({ ...prev, passwordStrength: calculatePasswordStrength(password) }))
  }

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 50) return 'bg-red-500'
    if (strength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return 'Muy débil'
    if (strength < 50) return 'Débil'
    if (strength < 75) return 'Buena'
    return 'Fuerte'
  }

  const validateForm = (): boolean => {
    if (!formData.agreeTerms) {
      setUiState((prev) => ({ ...prev, error: 'Debes aceptar los términos y condiciones' }))
      return false
    }

    if (formData.password.length < 8) {
      setUiState((prev) => ({ ...prev, error: 'La contraseña debe tener al menos 8 caracteres' }))
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setUiState((prev) => ({ ...prev, error: 'Las contraseñas no coinciden' }))
      return false
    }

    if (uiState.passwordStrength < 50) {
      setUiState((prev) => ({
        ...prev,
        error: 'La contraseña es muy débil. Debe incluir mayúsculas, minúsculas y números',
      }))
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setUiState((prev) => ({ ...prev, isSubmitting: true, error: '' }))

    try {
      const result = await completeUserRegistration({
        token: token!,
        password: formData.password,
        agreeTerms: formData.agreeTerms,
      })

      if (result.success) {
        // redirigir a continuar con el formulario
        router.push('/dashboard/tenant/formulario-de-tenant')
      } else {
        setUiState((prev) => ({
          ...prev,
          error: result.error || 'Error completando el registro',
        }))
      }
    } catch (error) {
      console.error('Error completing registration:', error)
      setUiState((prev) => ({
        ...prev,
        error: 'Error de conexión. Intenta nuevamente.',
      }))
    } finally {
      setUiState((prev) => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !uiState.isSubmitting && formData.password && formData.confirmPassword) {
      handleSubmit()
    }
  }

  // Estado de carga del token
  if (validationState.tokenChecking) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Validando enlace</h2>
          <p className="text-gray-600">Verificando tu token de registro...</p>
        </div>
      </div>
    )
  }

  // Token inválido o expirado
  if (validationState.tokenValid === false) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Enlace inválido</h2>
          <p className="text-gray-600 mb-6">
            El enlace de registro ha expirado o no es válido. Por favor, contacta con tu administrador para obtener un nuevo enlace.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition duration-200"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Formulario de registro
  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido!</h1>
          <p className="text-gray-600">
            Hola <span className="font-semibold">{validationState.tenant?.user.name}</span>, completa tu registro para continuar
          </p>
        </div>

        {/* Error message */}
        {uiState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{uiState.error}</p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={uiState.showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Crea una contraseña segura"
                disabled={uiState.isSubmitting}
              />
              <button
                type="button"
                onClick={() => setUiState((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={uiState.isSubmitting}
              >
                {uiState.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password strength */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Seguridad de la contraseña</span>
                  <span>{getPasswordStrengthText(uiState.passwordStrength)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(uiState.passwordStrength)}`}
                    style={{ width: `${uiState.passwordStrength}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={uiState.showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200"
                placeholder="Confirma tu contraseña"
                disabled={uiState.isSubmitting}
              />
              <button
                type="button"
                onClick={() => setUiState((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={uiState.isSubmitting}
              >
                {uiState.showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password match indicator */}
            {formData.confirmPassword && (
              <div className="mt-1">
                {formData.password === formData.confirmPassword ? (
                  <p className="text-green-600 text-xs flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Las contraseñas coinciden
                  </p>
                ) : (
                  <p className="text-red-600 text-xs flex items-center">
                    <XCircle className="w-3 h-3 mr-1" />
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Password requirements */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos de contraseña:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Al menos 8 caracteres
              </li>
              <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Una letra mayúscula
              </li>
              <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Una letra minúscula
              </li>
              <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Un número
              </li>
            </ul>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={formData.agreeTerms}
              onChange={(e) => setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))}
              className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
              disabled={uiState.isSubmitting}
            />
            <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              Acepto los{' '}
              <a href="/terminos" className="text-green-700 font-semibold hover:underline">
                términos y condiciones
              </a>{' '}
              y la{' '}
              <a href="/privacidad" className="text-green-700 font-semibold hover:underline">
                política de privacidad
              </a>
              .
            </label>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={
              uiState.isSubmitting ||
              !formData.password ||
              !formData.confirmPassword ||
              formData.password !== formData.confirmPassword ||
              !formData.agreeTerms
            }
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center"
          >
            {uiState.isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Completando registro...
              </>
            ) : (
              'Completar registro'
            )}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function RegisterWithToken() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Cargando</h2>
            <p className="text-gray-600">Preparando formulario de registro...</p>
          </div>
        </div>
      }
    >
      <RegisterWithTokenContent />
    </Suspense>
  )
}
