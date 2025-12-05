'use client'

import { useState, useEffect, useTransition, useActionState, createElement } from 'react'
import { useRouter } from 'next/navigation'

import {
  Building2,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Sparkles,
  BarChart3,
  Star,
  Check,
  User,
} from 'lucide-react'

import { authenticate } from '+/actions/auth/login'

const initialState = {
  success: false,
  message: '',
  errors: undefined as Record<string, string[]> | undefined,
}

// const isDevMode = process.env.NODE_ENV === "development";
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
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md w-full mx-4 text-center">
        <div className="w-24 h-24 bg-linear-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
          <Check className="w-12 h-12 text-white" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-3">¡Login Exitoso!</h3>
        <p className="text-gray-300 mb-8">Redirigiendo al dashboard...</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-75"></div>
          <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(authenticate, initialState)
  const [isPendingTransition, startTransition] = useTransition()

  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isLoading = isPending || isPendingTransition

  // Mount animation
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3)
    }, 4000)
    return () => {
      cancelAnimationFrame(frame)
      clearInterval(interval)
    }
  }, [])

  // Handle success
  useEffect(() => {
    if (!state?.success) return

    const frame = requestAnimationFrame(() => setShowSuccess(true))
    const timeout = setTimeout(() => {
      startTransition(() => {
        router.push('/dashboard')
      })
    }, 1500)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timeout)
    }
  }, [state?.success, router, startTransition])

  const handleSubmit = () => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    startTransition(() => {
      formAction(formData)
    })
  }

  const features = [
    {
      icon: Building2,
      title: 'Gestión Integral',
      description: 'Administra todas tus propiedades desde un solo lugar',
    },
    {
      icon: Users,
      title: 'Control de Inquilinos',
      description: 'Seguimiento completo de contratos y pagos',
    },
    {
      icon: BarChart3,
      title: 'Analytics Avanzados',
      description: 'Reportes detallados y métricas en tiempo real',
    },
  ]

  const benefits = [
    'Automatización completa de procesos',
    'Reducción de costos operativos',
    'Mejor experiencia del inquilino',
    'Reportes financieros en tiempo real',
    'Seguridad y cumplimiento garantizado',
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Success Overlay */}
      {showSuccess && <SuccessAnimation />}

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-6">
          <nav className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">PropertyHub</span>
                <div className="text-xs text-purple-300">Pro Management</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-white/80">
              <a href="#features" className="hover:text-white transition-colors">
                Características
              </a>
              <a href="#benefits" className="hover:text-white transition-colors">
                Beneficios
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                Contacto
              </a>
            </div>
          </nav>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div
              className={`space-y-10 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} transition-all duration-1000`}
            >
              {/* Hero Badge */}
              <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-5 py-3 rounded-full text-sm font-medium border border-purple-500/30">
                <Sparkles className="w-4 h-4" />
                <span>Sistema de Gestión Empresarial</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-8xl font-bold text-white leading-tight">
                  Gestiona
                  <span className="block bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    Propiedades
                  </span>
                  <span className="text-5xl lg:text-6xl text-gray-300">como un Pro</span>
                </h1>

                <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                  La plataforma más avanzada para administradores de propiedades e inquilinos. Automatiza
                  procesos, optimiza operaciones y transforma tu gestión inmobiliaria.
                </p>
              </div>

              {/* Feature Carousel */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <div className="flex items-start space-x-6">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                      {createElement(features[currentFeature].icon, {
                        className: 'w-8 h-8 text-white',
                      })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-2">{features[currentFeature].title}</h3>
                    <p className="text-gray-300 leading-relaxed">{features[currentFeature].description}</p>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex space-x-3 mt-6">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-500 ${
                        index === currentFeature ? 'bg-purple-400 w-12' : 'bg-white/20 w-3'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-6">¿Por qué elegir PropertyHub?</h3>
                <div className="grid grid-cols-1 gap-4">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 transition-all duration-300 hover:bg-white/10"
                    >
                      <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                      <span className="text-gray-300 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Login */}
            <form
              className={`${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} transition-all duration-1000 delay-300`}
            >
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-10 border border-white/20 shadow-2xl">
                {/* Login Header */}
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Acceso al Sistema</h2>
                  <p className="text-gray-300">Ingresa tus credenciales para continuar</p>
                </div>

                <div className="space-y-8">
                  {/* Email Field */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        Correo Electrónico
                      </label>

                      {/* Demo Users Icon */}
                      {isDevMode && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="p-2 bg-linear-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl backdrop-blur-sm text-blue-300 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                            title="Usuarios Demo"
                          >
                            <User className="w-5 h-5" />
                          </button>

                          {showUserMenu && (
                            <div className="absolute top-full right-0 mt-2 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-10">
                              <div className="p-4 border-b border-white/10">
                                <h4 className="text-white font-semibold text-center">Usuarios Demo</h4>
                                <p className="text-gray-300 text-xs text-center mt-1">
                                  Selecciona un usuario para probar
                                </p>
                              </div>
                              <div className="max-h-64 overflow-y-auto">
                                {demoUsers.map((user, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                      setEmail(user.email)
                                      setPassword(user.password)
                                      setShowUserMenu(false)
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-white/20 transition-colors text-white border-b border-white/5 last:border-b-0 group"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-linear-to-r from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center shrink-0 group-hover:from-purple-500/50 group-hover:to-pink-500/50 transition-all">
                                        <User className="w-4 h-4 text-purple-300" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{user.role}</div>
                                        <div className="text-xs text-gray-400 truncate">{user.email}</div>
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
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        disabled={isLoading || showSuccess}
                        className="w-full pl-14 pr-4 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg disabled:opacity-50"
                        placeholder="admin@propiedades.com"
                      />
                    </div>
                    {state?.errors?.email && (
                      <p className="text-red-300 text-sm flex items-center space-x-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        <span>{state.errors.email[0]}</span>
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wide">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={isLoading || showSuccess}
                        className="w-full pl-14 pr-14 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg disabled:opacity-50"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading || showSuccess}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {state?.errors?.password && (
                      <p className="text-red-300 text-sm flex items-center space-x-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        <span>{state.errors.password[0]}</span>
                      </p>
                    )}
                  </div>

                  {/* Messages */}
                  {state?.message && !state.success && (
                    <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-6 py-4 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-400 rounded-full shrink-0"></div>
                        <span className="font-medium">{state.message}</span>
                      </div>
                    </div>
                  )}

                  {state?.message && state.success && (
                    <div className="bg-green-500/20 border border-green-500/30 text-green-200 px-6 py-4 rounded-2xl backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                        <span className="font-medium">{state.message}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading || showSuccess}
                    className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 rounded-2xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Autenticando...</span>
                      </>
                    ) : showSuccess ? (
                      <>
                        <Check className="w-6 h-6 text-green-400" />
                        <span>¡Exitoso!</span>
                      </>
                    ) : (
                      <>
                        <span>Iniciar Sesión</span>
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Stats Section */}
          <div
            className={`mt-32 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 delay-700`}
          >
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold text-white mb-4">Resultados que Hablan por Sí Solos</h3>
              <p className="text-xl text-gray-300">Más de 1000 empresas confían en PropertyHub</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Building2, label: 'Propiedades', value: '1,200+' },
                { icon: Users, label: 'Inquilinos', value: '4,500+' },
                { icon: TrendingUp, label: 'Crecimiento', value: '35%' },
                { icon: Shield, label: 'Uptime', value: '99.9%' },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-linear-to-r from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-10 h-10 text-purple-400" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-3">{stat.value}</div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
