'use client'

import { useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '+/hooks/useSession'

type RequireAuthProps = {
  children: ReactNode
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter()
  const { status, isLoading } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/')
    }
  }, [router, status])

  if (isLoading || status === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
