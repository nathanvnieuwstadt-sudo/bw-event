import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
  secondary:
    'bg-neutral-900 text-neutral-300 border border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1',
  ghost:
    'bg-transparent text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-1',
}

const sizeClasses: Record<Size, string> = {
  sm: 'min-h-[40px] px-3.5 py-2 text-xs gap-1.5',
  md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2',
  lg: 'min-h-[48px] px-5 py-3 text-sm gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className = '',
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-md font-medium outline-none',
        'transition-[background-color,border-color,transform] duration-150',
        'active:scale-[0.97]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
