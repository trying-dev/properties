'use client'
import { useEffect, type ReactNode } from 'react'
import RequireAuth from '+/components/auth/RequireAuth'
import ErrorBoundary from '+/components/ErrorBoundary'
import { clearPostLoginRedirect } from '+/lib/postLoginRedirect'
import ProcessUpdatesPopup from './_/ProcessUpdatesPopup'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Ya llegó al dashboard: el destino recordado por el login deja de ser necesario.
  useEffect(() => {
    clearPostLoginRedirect()
  }, [])

  return (
    <RequireAuth>
      <ErrorBoundary>
        {children}
        <ProcessUpdatesPopup />
      </ErrorBoundary>
    </RequireAuth>
  )
}
