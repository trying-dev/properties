import { useEffect, useState } from 'react'
import { getSession } from './getSession'

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface User {
  id: string
  name: string
  email: string
  image?: string
  role: 'admin' | 'tenant'
  adminLevel?: string
  emailVerified?: Date | null
  phoneVerified?: Date | null
}

interface Session {
  user: User
  expires: string
}

interface UseSessionReturn {
  session: Session | null
  status: SessionStatus
  isLoading: boolean
  isAuthenticated: boolean
  user: User | null
  role: 'admin' | 'tenant' | null
}

export const useSession = (): UseSessionReturn => {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<SessionStatus>('loading')

  useEffect(() => {
    let mounted = true

    const fetchSession = async () => {
      try {
        const sessionData = await getSession()

        if (!mounted) return

        if (sessionData?.user) {
          setSession(sessionData)
          setStatus('authenticated')
        } else {
          setSession(null)
          setStatus('unauthenticated')
        }
      } catch (error) {
        console.error('Error fetching session:', error)
        if (mounted) {
          setSession(null)
          setStatus('unauthenticated')
        }
      }
    }

    fetchSession()

    return () => {
      mounted = false
    }
  }, [])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    user: session?.user || null,
    role: session?.user?.role || null,
  }
}
