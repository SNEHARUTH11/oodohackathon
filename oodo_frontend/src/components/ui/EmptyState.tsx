import type { ReactNode } from 'react'

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-dayflow-border bg-white p-8 text-center">
      <div className="text-lg font-semibold text-dayflow-text">{title}</div>
      {description && <p className="mt-2 text-sm text-dayflow-muted">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
