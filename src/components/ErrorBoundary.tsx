'use client'

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import ErrorFallback from '+/components/ErrorFallback'
import { classifyError, logError } from '+/lib/error-logger'
import type { ErrorType } from '+/lib/error-logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
  resetKeys?: unknown[]
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorType: ErrorType
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorType: 'generic' }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorType: classifyError(error) }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const { onError } = this.props
    const errorType = classifyError(error)
    logError({
      timestamp: new Date().toISOString(),
      errorType,
      message: error.message,
      stack: error.stack,
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      metadata: { componentStack: info.componentStack ?? undefined },
    })
    onError?.(error, info)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (!this.state.hasError) return
    const { resetKeys } = this.props
    if (resetKeys && prevProps.resetKeys) {
      const changed = resetKeys.some((key, i) => key !== prevProps.resetKeys?.[i])
      if (changed) {
        this.reset()
      }
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null, errorType: 'generic' })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <ErrorFallback
          errorType={this.state.errorType}
          message={this.state.error?.message}
          onReset={this.reset}
        />
      )
    }
    return this.props.children
  }
}
