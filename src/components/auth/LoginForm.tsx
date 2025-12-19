'use client'

import { FormEvent, startTransition, useEffect, useState, useActionState } from 'react'
import { ArrowRight, CheckCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { authenticate } from '+/actions/auth/login'
import { authInitialState, type AuthActionState } from './types'
import { demoUsers as defaultDemoUsers } from './users'
import { useDispatch } from '+/redux'
import {
  setAuthVerificationExpires,
  setIsAuthenticated,
  setLoginState,
  setResetPasswordModalOpen,
} from '+/redux/slices/auth'
import { setUser } from '+/redux/slices/user'
import { getUserAfterLogin } from '+/actions/user'

type LoginFormProps = {
  className?: string
}

export default function LoginForm({
  className = 'transition-opacity duration-500 opacity-100',
}: LoginFormProps) {
  const dispatch = useDispatch()
  const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
    authenticate,
    authInitialState
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const demoUsers = defaultDemoUsers

  useEffect(() => {
    if (!state?.success) return

    dispatch(setAuthVerificationExpires(null))
    dispatch(setLoginState('success'))
    dispatch(setIsAuthenticated(true))

    const syncUser = async () => {
      const user = await getUserAfterLogin({ email })
      dispatch(setUser(user))
      dispatch(setLoginState('idle'))
    }

    void syncUser()
  }, [state?.success, dispatch, email])

  useEffect(() => {
    if (!state?.errors) return
    dispatch(setLoginState('idle'))
  }, [dispatch, state?.errors])

  const isDisabled = isPending || Boolean(state?.success)
  const inputPadding = 'py-3'
  const buttonPadding = 'py-3.5'
  const hasDemoUsers = demoUsers.length > 0

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('email', email.trim())
    formData.append('password', password)
    dispatch(setLoginState('loading'))
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Email Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          {hasDemoUsers && (
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
                          setEmail(user.email)
                          setPassword(user.password)
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={isDisabled}
            className={`w-full pl-11 pr-4 ${inputPadding} border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50`}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={isDisabled}
            className={`w-full pl-11 pr-12 ${inputPadding} border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isDisabled}
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
        {state?.errors?.form && (
          <p className="text-red-500 text-sm flex items-center space-x-1">
            <span>⚠</span>
            <span>{state.errors.form[0]}</span>
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isDisabled}
        className={`w-full bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold ${buttonPadding} px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none`}
      >
        {isPending ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Autenticando...</span>
          </>
        ) : state?.success ? (
          <>
            <CheckCircle className="w-5 h-5" />
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
          onClick={() => dispatch(setResetPasswordModalOpen(true))}
          className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
          disabled={isDisabled}
        >
          Forgot your password?
        </button>
      </div>
    </form>
  )
}
