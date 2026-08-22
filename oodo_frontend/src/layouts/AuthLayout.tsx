import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'

export function AuthLayout({ children }: { children?: ReactNode }) {
  return <div className="min-h-screen bg-dayflow-bg">{children ?? <Outlet />}</div>
}
