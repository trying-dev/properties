'use client'

import Image from 'next/image'
import { useState, useEffect, useTransition, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, Check, User, ArrowRight, CheckCircle, X } from 'lucide-react'
import { authenticate } from '+/actions/auth/login'
import { sendResetPasswordEmail } from '+/actions/auth/reset-password'
import Modal from '+/components/Modal'

const initialState = {
  success: false,
  message: '',
  errors: undefined as Record<string, string[]> | undefined,
}

const isDevMode = true
const passwordDemo = process.env.NEXT_PUBLIC_PASSWORD_DEMO || 'No Password'

const adminUsers = [
  {
    role: 'Super Admin',
    email: 'admin1@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Manager',
    email: 'admin2@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Standard Admin',
    email: 'admin3@propiedades.com',
    password: passwordDemo,
  },
  {
    role: 'Portero (Limited)',
    email: 'portero@propiedades.com',
    password: passwordDemo,
  },
]

const tenantUsers = [
  {
    role: 'Inquilino - Ana Comerciante',
    email: 'comerciante1@gmail.com',
    password: passwordDemo,
  },
  {
    role: 'Inquilino - Pedro Empresario',
    email: 'comerciante2@gmail.com',
    password: passwordDemo,
  },
  {
    role: 'Inquilino - Laura Hernandez',
    email: 'residente1@gmail.com',
    password: passwordDemo,
  },
  {
    role: 'Inquilino - John Smith',
    email: 'extranjero1@gmail.com',
    password: passwordDemo,
  },
]

const demoUsers = [...adminUsers, ...tenantUsers]

function SuccessAnimation() {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-3xl p-12 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="w-24 h-24 bg-linear-to-r from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-gray-800 mb-3">¡Login Exitoso!</h3>
        <p className="text-gray-600 mb-8">Redirigiendo al dashboard...</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  )
}

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

function ResetPasswordModal({ isOpen, onClose }: ResetPasswordModalProps) {
  const [resetEmail, setResetEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

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
        onClose()
      }, 3000)
    } catch (err) {
      setError('Error al enviar el correo. Por favor intenta nuevamente.')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} ariaLabel="Reset password" disableClose={isSubmitting}>
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
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
                  Por favor revisa tu bandeja de entrada y sigue las instrucciones para resetear tu
                  contraseña.
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
                onClick={onClose}
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

export default function AuthPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(authenticate, initialState)
  const [isPendingTransition, startTransition] = useTransition()

  // Tab state
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const mounted = true
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerAreaOfInterest, setRegisterAreaOfInterest] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const isLoading = isPending || isPendingTransition

  useEffect(() => {
    if (!state?.success) return
    const timeout = setTimeout(() => {
      startTransition(() => {
        router.push('/dashboard')
      })
    }, 1500)

    return () => clearTimeout(timeout)
  }, [state?.success, router, startTransition])

  const handleLoginSubmit = () => {
    const formData = new FormData()
    formData.append('email', loginEmail)
    formData.append('password', loginPassword)
    startTransition(() => {
      formAction(formData)
    })
  }

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí implementarías la lógica de registro
    console.log('Register:', {
      name: registerName,
      email: registerEmail,
      password: registerPassword,
      areaOfInterest: registerAreaOfInterest,
      agreeTerms,
    })
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {state?.success && <SuccessAnimation />}

      {/* Reset Password Modal */}
      <ResetPasswordModal isOpen={showResetPasswordModal} onClose={() => setShowResetPasswordModal(false)} />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Panel - Image/Info */}
        <div className="hidden lg:flex bg-linear-to-br from-teal-400 via-teal-500 to-cyan-500 p-16 flex-col justify-center items-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-300/20 rounded-full blur-3xl"></div>

          {/* Community Image */}
          <div className="relative z-10 text-center">
            <div className="mb-8">
              <div className="w-80 h-80 mx-auto relative rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://picsum.photos/id/64/800/800"
                  alt="Community"
                  className="w-full h-full object-cover"
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-teal-900/40 to-transparent"></div>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              Gestiona tu Comunidad
              <br />
              con Confianza
            </h2>
            <p className="text-teal-100 text-lg">
              Administra propiedades y pagos
              <br />
              desde un solo lugar de forma simple y segura
            </p>
          </div>
        </div>

        {/* Right Panel - Forms */}
        <div className="p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Tabs */}
            <div className="flex mb-8 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'login'
                    ? 'bg-white text-teal-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'register'
                    ? 'bg-white text-teal-600 shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Register
              </button>
            </div>

            {/* Login Form */}
            {activeTab === 'login' && (
              <div
                className={`space-y-6 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
              >
                {/* Email Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isDevMode && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowUserMenu(!showUserMenu)}
                          className="p-2 bg-teal-50 border border-teal-200 rounded-lg text-teal-600 hover:bg-teal-100 transition-all duration-200"
                          title="Usuarios Demo"
                        >
                          <User className="w-4 h-4" />
                        </button>

                        {showUserMenu && (
                          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-10">
                            <div className="p-3 border-b border-gray-100">
                              <h4 className="text-gray-800 font-semibold text-sm">Usuarios Demo</h4>
                              <p className="text-gray-500 text-xs mt-1">Selecciona para autocompletar</p>
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                              {demoUsers.map((user, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setLoginEmail(user.email)
                                    setLoginPassword(user.password)
                                    setShowUserMenu(false)
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                                      <User className="w-4 h-4 text-teal-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm text-gray-800">{user.role}</div>
                                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={isLoading || state?.success}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="janedoe@mail.com"
                    />
                  </div>
                  {state?.errors?.email && (
                    <p className="text-red-500 text-sm flex items-center space-x-1">
                      <span>⚠</span>
                      <span>{state.errors.email[0]}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      disabled={isLoading || state?.success}
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || state?.success}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {state?.errors?.password && (
                    <p className="text-red-500 text-sm flex items-center space-x-1">
                      <span>⚠</span>
                      <span>{state.errors.password[0]}</span>
                    </p>
                  )}
                </div>

                {/* Messages */}
                {state?.message && !state.success && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <span>⚠</span>
                      <span className="text-sm font-medium">{state.message}</span>
                    </div>
                  </div>
                )}

                {state?.message && state.success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium">{state.message}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleLoginSubmit}
                  disabled={isLoading || state?.success}
                  className="w-full bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Autenticando...</span>
                    </>
                  ) : state?.success ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>¡Exitoso!</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(true)}
                    className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form
                onSubmit={handleRegisterSubmit}
                className={`space-y-5 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
              >
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="Jane Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="janedoe@mail.com"
                    />
                  </div>
                </div>

                {/* Area of Interest */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Area of interest</label>
                  <div className="relative">
                    <select
                      value={registerAreaOfInterest}
                      onChange={(e) => setRegisterAreaOfInterest(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value="">Select your interest</option>
                      <option value="fiction">Fiction</option>
                      <option value="non-fiction">Non-Fiction</option>
                      <option value="science">Science</option>
                      <option value="technology">Technology</option>
                      <option value="business">Business</option>
                      <option value="self-help">Self-Help</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
                      Terms & Conditions
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!agreeTerms}
                  className="w-full bg-linear-to-r from-cyan-400 to-teal-400 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-cyan-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                >
                  <span>Sign up</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
