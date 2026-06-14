'use client'
import type { ReactNode } from 'react'
import RequireAuth from '+/components/auth/RequireAuth'
import ErrorBoundary from '+/components/ErrorBoundary'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <RequireAuth>
      <ErrorBoundary>{children}</ErrorBoundary>
    </RequireAuth>
  )
}

