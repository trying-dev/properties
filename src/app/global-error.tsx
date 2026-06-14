'use client'

import ErrorFallback from '+/components/ErrorFallback'
import { classifyError, logError } from '+/lib/error-logger'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const errorType = classifyError(error)
  logError({
    timestamp: new Date().toISOString(),
    errorType,
    message: error.message,
    stack: error.stack,
    route: 'root',
    digest: error.digest,
  })

  return (
    <html lang="es">
      <body>
        <ErrorFallback errorType={errorType} message={error.message} onReset={reset} />
      </body>
    </html>
  )
}
