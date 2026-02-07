'use client'

import { useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'

import Modal from '+/components/Modal'
import AuthFormsPanel from '+/components/auth/AuthFormsPanel'
import { useSelector } from '+/redux'
import { getTenantFavoriteUnitIdsAction, toggleTenantFavoriteUnitAction } from '+/actions/favorites'

type UnitFavoriteButtonProps = {
  unitId: string
}

export default function UnitFavoriteButton({ unitId }: UnitFavoriteButtonProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const pendingFavoriteRef = useRef(false)
  const reduxIsAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const reduxUser = useSelector((state) => state.user)
  const isAuthenticated = reduxIsAuthenticated
  const role = reduxUser?.role ?? null

  useEffect(() => {
    let isMounted = true

    const loadFavorites = async () => {
      if (!isAuthenticated || role !== 'tenant') {
        if (isMounted) setIsFavorite(false)
        return
      }
      setIsLoading(true)
      const result = await getTenantFavoriteUnitIdsAction()
      if (isMounted && result.success) {
        const favoriteIds = result.data ?? []
        setIsFavorite(favoriteIds.includes(unitId))
      }
      if (isMounted) setIsLoading(false)
    }

    void loadFavorites()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, role, unitId])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      pendingFavoriteRef.current = true
      setIsAuthModalOpen(true)
      return
    }
    if (role !== 'tenant' || isLoading) return
    setIsLoading(true)
    const result = await toggleTenantFavoriteUnitAction(unitId)
    if (result.success && result.data) {
      setIsFavorite(result.data.isFavorite)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (!isAuthenticated || !pendingFavoriteRef.current) return
    pendingFavoriteRef.current = false
    if (role !== 'tenant') return
    void handleToggle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, role])

  const heartClassName = isFavorite ? 'text-gray-800 fill-gray-800' : 'text-gray-600 group-hover:text-gray-700'

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        aria-pressed={isFavorite}
        className="group w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer disabled:opacity-60"
      >
        <Heart className={`w-5 h-5 transition-colors duration-200 ${heartClassName}`} />
      </button>

      <Modal
        isOpen={isAuthModalOpen && !isAuthenticated}
        onClose={() => setIsAuthModalOpen(false)}
        ariaLabel="Inicia sesión para guardar favoritos"
        className="max-w-lg"
      >
        <AuthFormsPanel />
      </Modal>
    </>
  )
}
