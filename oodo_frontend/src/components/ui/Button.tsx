import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dayflow-green/40 disabled:cursor-not-allowed disabled:opacity-60'

  const variants: Record<Variant, string> = {
    primary: 'bg-dayflow-navy text-white hover:bg-[#1c213a]',
    secondary: 'border border-dayflow-border bg-white text-dayflow-text hover:bg-dayflow-bg',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100',
    ghost: 'bg-transparent text-dayflow-text hover:bg-dayflow-bg'
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
