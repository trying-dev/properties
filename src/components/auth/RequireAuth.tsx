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

  if (isLoading || status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-red-600" />
      </div>
    )
  }
  if (status === 'unauthenticated' || !isAuthenticated) {
    return null
  }
  return <>{children}</>
}
