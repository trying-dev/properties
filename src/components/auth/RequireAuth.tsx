'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '+/hooks/useSession'
import { useSelector } from '+/redux'

type RequireAuthProps = {
  children: ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter()
  const { status, isLoading } = useSession()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' || !isAuthenticated) {
      router.replace('/')
    }
  }, [isAuthenticated, router, status])

  if (isLoading || status === 'unauthenticated' || !isAuthenticated) {
    return null
  }

  return <>{children}</>
}
