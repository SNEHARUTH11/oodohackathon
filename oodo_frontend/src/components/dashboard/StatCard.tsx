import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

export function StatCard({ title, value, subtitle, icon, accent }: { title: string; value: string; subtitle: string; icon: ReactNode; accent?: string }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-dayflow-muted">{title}</div>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-dayflow-text">{value}</div>
          <div className="mt-2 text-xs text-dayflow-muted">{subtitle}</div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent || 'bg-dayflow-greenSoft'} text-dayflow-navy`}>{icon}</div>
      </div>
    </Card>
  )
}
