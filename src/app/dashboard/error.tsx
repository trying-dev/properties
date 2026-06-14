'use client'

import { useEffect } from 'react'
import ErrorFallback from '+/components/ErrorFallback'
import { classifyError, logError } from '+/lib/error-logger'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const errorType = classifyError(error)

  useEffect(() => {
    logError({
      timestamp: new Date().toISOString(),
      errorType,
      message: error.message,
      stack: error.stack,
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      digest: error.digest,
    })
  }, [error, errorType])

  useEffect(() => {
    if (errorType === 'auth' && typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }, [errorType])

  return (
    <ErrorFallback errorType={errorType} message={error.message} onReset={reset} />
  )
}
