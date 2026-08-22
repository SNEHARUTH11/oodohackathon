import type { ReactNode } from 'react'

export function Badge({ children, className = '', green = false }: { children: ReactNode; className?: string; green?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${green ? 'bg-dayflow-greenSoft text-dayflow-success' : 'bg-dayflow-bg text-dayflow-muted'} ${className}`}>
      {children}
    </span>
  )
}
