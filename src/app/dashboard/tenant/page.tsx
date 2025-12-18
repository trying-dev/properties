'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Search, Heart, User, Building2, MessageSquare, FileText } from 'lucide-react'

import { getUserTenant, type UserTenant } from '+/actions/user'
import Footer from '+/components/Footer'
import Header from '+/components/Header'

export default function TenantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<UserTenant>()
  const [loading, setLoading] = useState(true)

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
      id: 'processes',
      icon: FileText,
      title: 'Procesos',
      description: 'Revisa tus procesos abiertos',
      onClick: () => router.push('/dashboard/tenant/processes'),
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
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
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

      <Footer />
    </div>
  )
}
