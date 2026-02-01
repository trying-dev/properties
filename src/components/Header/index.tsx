'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, Home, LogOut } from 'lucide-react'

import AuthModal from '+/components/auth/AuthModal'
import ResetPasswordModal from '+/components/auth/ResetPasswordModal'
import styles from './Header.module.scss'
import { logout } from '+/hooks/getSession'
import { useSession } from '+/hooks/useSession'
import { useDispatch, useSelector } from '+/redux'
import { setAuthModalOpen, setAuthVerificationExpires, setIsAuthenticated } from '+/redux/slices/auth'
import { setUser } from '+/redux/slices/user'

export default function Header() {
  const router = useRouter()
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const syncHandledRef = useRef(false)

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const user = useSelector((state) => state.user)
  const { status, clearSession, refreshSession } = useSession()

  const isAuthenticatedSession = status === 'authenticated'
  const isLoadingSession = status === 'loading'
  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U'
  const dashboardHref = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/tenant'

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

  const openRegister = () => dispatch(setAuthModalOpen({ open: true, tab: 'register' }))
  const openLogin = () => dispatch(setAuthModalOpen({ open: true, tab: 'login' }))
  const toggleMenu = () => setOpen((prev) => !prev)
  const closeMenu = () => setOpen(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const Authorized = (
    <div className={styles.menuWrapper} ref={menuRef}>
      <button onClick={toggleMenu} className={styles.menuButton}>
        <span className={styles.userName}>
          {user?.name} {user?.lastName}
        </span>
        <div className={styles.avatar}>
          <span className={styles.initials}>{initials}</span>
        </div>
        <ChevronDown className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} />
      </button>

      {open && (
        <div className={styles.dropdown}>
          <Link href={dashboardHref} onClick={closeMenu} className={styles.dropdownLink}>
            Ir a mi perfil
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  )

  const Unauthorized = (
    <div className={styles.authActions}>
      <button type="button" onClick={openRegister} className={styles.registerBtn}>
        Registrarse
      </button>
      <button type="button" onClick={openLogin} className={styles.loginBtn}>
        Iniciar sesión
      </button>
    </div>
  )

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.row}>
          <Link href="/" className={styles.brand}>
            <div className={styles.logo}>
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className={styles.brandText}>Properties</span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/propiedades" className={styles.navLinkPrimary}>
              Buscar
            </Link>
            <Link href="/" className={styles.navLinkSecondary}>
              Sobre Nosotros
            </Link>
          </nav>

          {isLoadingSession ? <div className={styles.skeleton} /> : isAuthenticatedSession ? Authorized : Unauthorized}
        </div>
      </div>

      <AuthModal />

      <ResetPasswordModal />
    </header>
  )
}
