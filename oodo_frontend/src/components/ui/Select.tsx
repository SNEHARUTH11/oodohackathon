import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ label: string; value: string }>
  error?: string
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <label className="block space-y-2 text-sm text-dayflow-text">
      {label && <span className="font-medium">{label}</span>}
      <select
        {...props}
        className={`h-11 w-full rounded-xl border border-dayflow-border bg-white px-3 text-sm text-dayflow-text outline-none transition focus:border-dayflow-green focus:ring-2 focus:ring-dayflow-green/20 ${error ? 'border-red-300' : ''} ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  )
}
