'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Search, Heart, User, LogOut, ChevronDown, Building2, MessageSquare } from 'lucide-react'
import { getUserTenant } from '+/actions/user'
import { UserTenant } from '+/actions/user/manager'
import { logout } from '+/hooks/getSession'

export default function TenantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserTenant>()
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUserTenant()
      if (userData) {
        setUser(userData)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const contracts = user?.tenant?.contracts || []

  const menuOptions = [
    {
      id: 'messages',
      icon: MessageSquare,
      title: 'Mensajes',
      description: 'Comunicación con administración',
      onClick: () => router.push('/dashboard/tenant/mensajes'),
      badge: null,
    },
    {
      id: 'search',
      icon: Search,
      title: 'Buscar Propiedades',
      description: 'Explora propiedades disponibles',
      onClick: () => router.push('/propiedades'),
      badge: null,
    },
    {
      id: 'favorites',
      icon: Heart,
      title: 'Favoritos',
      description: 'Propiedades que te interesan',
      onClick: () => router.push('/dashboard/tenant/favoritos'),
      badge: null,
    },
    {
      id: 'profile',
      icon: User,
      title: 'Perfil y Documentos',
      description: 'Información personal y archivos',
      onClick: () => router.push('/dashboard/tenant/perfil'),
      badge: null,
    },
    {
      id: 'properties',
      icon: Building2,
      title: 'Propiedades Alquiladas',
      description: `${contracts.length} ${contracts.length === 1 ? 'propiedad' : 'propiedades'}`,
      onClick: () => router.push('/dashboard/tenant/mis-propiedades'),
      badge: contracts.length > 0 ? contracts.length : null,
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Properties</span>
            </div>

            {/* User Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 hidden sm:block">
                  {user?.name} {user?.lastName}
                </span>
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hola</h1>
          <p className="text-gray-600">Bienvenido a tu área personal</p>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  <option.icon className="h-8 w-8 text-gray-900" strokeWidth={1.5} />
                </div>
                {option.badge !== null && (
                  <span className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {option.badge}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-700">
                {option.title}
              </h3>
              <p className="text-sm text-gray-600">{option.description}</p>
            </button>
          ))}
        </div>

        {/* Welcome Message for New Users */}
        {contracts.length === 0 && (
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes propiedades alquiladas</h3>
            <p className="text-gray-600 mb-6">Explora nuestro catálogo y encuentra tu próximo hogar</p>
            <button
              onClick={() => router.push('/propiedades')}
              className="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>Buscar Propiedades</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
