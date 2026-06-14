export type ErrorType = 'generic' | 'network' | 'auth' | 'not_found'

export interface ErrorLogEntry {
  timestamp: string
  errorType: ErrorType
  message: string
  stack?: string
  route: string
  digest?: string
  metadata?: Record<string, unknown>
}

export function classifyError(error: Error): ErrorType {
  const message = error.message?.toLowerCase() ?? ''
  if (message.includes('auth') || message.includes('session') || message.includes('unauthorized')) {
    return 'auth'
  }
  if (
    error instanceof TypeError &&
    (message.includes('failed to fetch') || message.includes('network'))
  ) {
    return 'network'
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return 'network'
  }
  return 'generic'
}

export function logError(entry: ErrorLogEntry): void {
  console.error('[ErrorBoundary]', JSON.stringify(entry))
}
