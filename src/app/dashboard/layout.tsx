'use client'

import type { ReactNode } from 'react'
import RequireAuth from '+/components/auth/RequireAuth'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <RequireAuth>{children}</RequireAuth>
}
