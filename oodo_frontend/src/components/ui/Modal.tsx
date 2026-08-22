import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11111F]/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-dayflow-border bg-white p-5 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-dayflow-text">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-dayflow-muted hover:bg-dayflow-bg" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
