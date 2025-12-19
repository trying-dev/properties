'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Home, LogOut } from 'lucide-react'

import AuthModal from '+/components/auth/AuthModal'
import ResetPasswordModal from '+/components/auth/ResetPasswordModal'
import { logout } from '+/hooks/getSession'
import { useSession } from '+/hooks/useSession'
import { useDispatch, useSelector } from '+/redux'
import { setAuthModalOpen, setAuthVerificationExpires, setIsAuthenticated } from '+/redux/slices/auth'
import { setUser } from '+/redux/slices/user'

export default function Header() {
  const router = useRouter()
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const user = useSelector((state) => state.user)
  const { status, clearSession, refreshSession } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const syncHandledRef = useRef(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    clearSession()
    dispatch(setUser(null))
    dispatch(setIsAuthenticated(false))
    setOpen(false)
    await refreshSession()
    router.push('/')
    router.refresh()
  }

  const isAuthenticatedSession = status === 'authenticated'
  const isLoadingSession = status === 'loading'
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U'
  const dashboardHref = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/tenant'

  useEffect(() => {
    if (!isAuthenticated) {
      syncHandledRef.current = false
      return
    }
    if (syncHandledRef.current) return
    syncHandledRef.current = true
    const syncSession = async () => {
      await refreshSession()
      dispatch(setAuthVerificationExpires(null))
      dispatch(setAuthModalOpen({ open: false }))
      router.refresh()
    }
    syncSession()
  }, [dispatch, isAuthenticated, refreshSession, router])

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 flex items-center justify-center rounded-lg">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Properties</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/propiedades" className="text-sm font-medium text-gray-900 hover:text-gray-700">
              Buscar
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sobre Nosotros
            </Link>
          </nav>

          {isLoadingSession ? (
            <div className="w-28 h-9 rounded-md bg-gray-100 animate-pulse" />
          ) : isAuthenticatedSession ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center space-x-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 hidden sm:block">
                  {user?.name} {user?.lastName}
                </span>
                <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-gray-700">{initials}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Ir a mi perfil
                  </Link>
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
          ) : (
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  dispatch(setAuthModalOpen({ open: true, tab: 'register' }))
                }}
                className="text-sm font-medium text-gray-900 hover:text-gray-700"
              >
                Registrarse
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(setAuthModalOpen({ open: true, tab: 'login' }))
                }}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal />

      <ResetPasswordModal />
    </header>
  )
}
