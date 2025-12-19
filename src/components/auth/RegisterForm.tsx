'use client'

import { FormEvent, startTransition, useEffect, useMemo, useState, useActionState, useTransition } from 'react'
import { ArrowRight, CheckCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { registerUser, type RegisterActionState } from '+/actions/auth/register'
import { authenticate } from '+/actions/auth/login'
import { resendVerificationCode, verifyEmailCode } from '+/actions/auth/verify-email'
import { useDispatch, useSelector } from '+/redux'
import {
  setAuthVerificationExpires,
  setCodeVerificationState,
  setIsAuthenticated,
  setRegisterState,
} from '+/redux/slices/auth'

type RegisterFormProps = {
  className?: string
}

export default function RegisterForm({
  className = 'transition-opacity duration-500 opacity-100',
}: RegisterFormProps) {
  const router = useRouter()
  const dispatch = useDispatch()
  const [state, formAction, isPending] = useActionState<RegisterActionState, FormData>(registerUser, {
    success: false,
  })
  const [phaseOverride, setPhaseOverride] = useState<'register' | 'done'>('register')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [signInError, setSignInError] = useState('')
  const [emailForVerification, setEmailForVerification] = useState('')
  const [isVerifying, startVerifyTransition] = useTransition()
  const [isResending, startResendTransition] = useTransition()
  const verificationExpiresAt = useSelector((s) => s.auth.verificationExpiresAt)
  const [now, setNow] = useState(() => Date.now())

  const phase: 'register' | 'verify' | 'done' =
    phaseOverride === 'done' ? 'done' : state?.needsVerification ? 'verify' : 'register'
  const isRegisterDisabled = isPending || phase !== 'register'

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!agreeTerms) return
    setEmailForVerification(email.trim())
    dispatch(setRegisterState('loading'))
    const formData = new FormData()
    formData.append('firstName', firstName.trim())
    formData.append('lastName', lastName.trim())
    formData.append('email', email.trim())
    formData.append('password', password)
    formData.append('agreeTerms', agreeTerms ? 'on' : '')

    startTransition(() => {
      formAction(formData)
    })
  }

  useEffect(() => {
    if (!state?.needsVerification) return
    dispatch(setRegisterState('success'))
    dispatch(setRegisterState('idle'))
    dispatch(setCodeVerificationState('start'))
    // fallback client timer; server already enforces 15 min
    dispatch(setAuthVerificationExpires(Date.now() + 15 * 60 * 1000))
  }, [dispatch, state?.needsVerification])

  useEffect(() => {
    if (!state?.errors) return
    dispatch(setRegisterState('idle'))
  }, [dispatch, state?.errors])

  const handleVerifyCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!verificationCode.trim() || !emailForVerification) return
    if (verificationExpiresAt && Date.now() > verificationExpiresAt) {
      setVerificationError('El código ha expirado, solicita uno nuevo.')
      return
    }
    setVerificationError('')
    dispatch(setCodeVerificationState('loading'))
    startVerifyTransition(async () => {
      const result = await verifyEmailCode(emailForVerification, verificationCode.trim())
      if (!result?.success) {
        setVerificationError(result?.errors?.form?.[0] || 'Código inválido')
        dispatch(setCodeVerificationState('idle'))
        return
      }
      // Login via server action to avoid client-side next-auth route dependency
      const loginForm = new FormData()
      loginForm.append('email', emailForVerification)
      loginForm.append('password', password)
      const loginResult = await authenticate(undefined, loginForm)
      if (!loginResult?.success) {
        setSignInError(loginResult?.errors?.form?.[0] || 'Código verificado, pero no pudimos iniciar sesión.')
        dispatch(setCodeVerificationState('idle'))
        return
      }
      setPhaseOverride('done')
      dispatch(setCodeVerificationState('success'))
      dispatch(setAuthVerificationExpires(null))
      dispatch(setIsAuthenticated(true))
      dispatch(setCodeVerificationState('idle'))
      router.push('/dashboard')
    })
  }

  const handleResendCode = () => {
    if (!emailForVerification) return
    setVerificationError('')
    startResendTransition(async () => {
      const result = await resendVerificationCode(emailForVerification)
      if (!result?.success) {
        setVerificationError(result?.errors?.form?.[0] || 'No pudimos reenviar el código.')
        return
      }
      dispatch(setAuthVerificationExpires(Date.now() + 15 * 60 * 1000))
      setNow(Date.now())
    })
  }

  useEffect(() => {
    if (!verificationExpiresAt || phase !== 'verify') return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [verificationExpiresAt, phase])

  const countdown = useMemo(() => {
    if (!verificationExpiresAt || phase !== 'verify') return null
    const remaining = Math.max(verificationExpiresAt - now, 0)
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }, [now, phase, verificationExpiresAt])

  const spaceY5Class = ['space-y-5', className].filter(Boolean).join(' ')

  if (phase === 'verify') {
    return (
      <form onSubmit={handleVerifyCode} className={spaceY5Class}>
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold text-gray-800">Verifica tu email</h3>
          <p className="text-sm text-gray-600">
            Enviamos un código a <span className="font-medium text-teal-600">{emailForVerification}</span>.
            Ingresa el código para activar tu cuenta.
          </p>
          {countdown && (
            <p className="text-xs text-gray-500">
              Código válido por: <span className="font-semibold text-teal-600">{countdown}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Código de verificación</label>
          <div className="relative">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
              inputMode="numeric"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              placeholder="123456"
              disabled={isVerifying}
            />
          </div>
          {verificationError && (
            <p className="text-red-500 text-sm flex items-center space-x-1">
              <span>⚠</span>
              <span>{verificationError}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isVerifying || verificationCode.length !== 6}
          className="w-full bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
        >
          {isVerifying ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <span>Confirmar código</span>
              <CheckCircle className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="text-center text-sm text-gray-500">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending}
            className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
          >
            {isResending ? 'Reenviando...' : 'Reenviar código'}
          </button>
        </div>
      </form>
    )
  }

  if (phase === 'done') {
    return (
      <div className={['space-y-4 text-center', className].filter(Boolean).join(' ')}>
        <div className="w-16 h-16 bg-green-100 text-green-600 mx-auto rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800">¡Cuenta verificada!</h3>
        <p className="text-gray-600 text-sm">Ya puedes iniciar sesión con tu email y contraseña.</p>
        {signInError && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <span>⚠</span>
            <span>{signInError}</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={spaceY5Class}>
      {/* First Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">First name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isRegisterDisabled}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
            placeholder="Jane"
          />
        </div>
        {state?.errors?.firstName && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <span>⚠</span>
            <span>{state.errors.firstName[0]}</span>
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Last name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isRegisterDisabled}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
            placeholder="Doe"
          />
        </div>
        {state?.errors?.lastName && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <span>⚠</span>
            <span>{state.errors.lastName[0]}</span>
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isRegisterDisabled}
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

      {/* Password */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isRegisterDisabled}
            className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            disabled={isRegisterDisabled}
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
        {state?.errors?.form && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <span>⚠</span>
            <span>{state.errors.form[0]}</span>
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="terms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
          disabled={isRegisterDisabled}
        />
        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
          I agree to the{' '}
          <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">
            Terms & Conditions
          </a>
        </label>
        {state?.errors?.agreeTerms && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <span>⚠</span>
            <span>{state.errors.agreeTerms[0]}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!agreeTerms || isRegisterDisabled}
        className="w-full bg-linear-to-r from-cyan-400 to-teal-400 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-cyan-500 hover:to-teal-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
      >
        {isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Creando cuenta...</span>
          </>
        ) : (
          <>
            <span>Sign up</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  )
}
