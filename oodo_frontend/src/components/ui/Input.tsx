import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <label className="block space-y-2 text-sm text-dayflow-text">
      {label && <span className="font-medium">{label}</span>}
      <input
        {...props}
        className={`h-11 w-full rounded-xl border border-dayflow-border bg-white px-3 text-sm text-dayflow-text outline-none transition focus:border-dayflow-green focus:ring-2 focus:ring-dayflow-green/20 ${error ? 'border-red-300' : ''} ${className}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
}
