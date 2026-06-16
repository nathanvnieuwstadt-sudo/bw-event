import type { ReactNode } from 'react'

type Color = 'stone' | 'green' | 'amber' | 'red' | 'blue'

interface Props {
  color?: Color
  children: ReactNode
}

const colorClasses: Record<Color, string> = {
  stone: 'bg-stone-100 text-stone-600 ring-stone-200',
  green: 'bg-green-50 text-green-700 ring-green-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  red:   'bg-red-50 text-red-600 ring-red-200',
  blue:  'bg-brand-50 text-brand-700 ring-brand-200',
}

export function Badge({ color = 'stone', children }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2 py-0.5',
        'text-[11px] font-medium ring-1 ring-inset',
        colorClasses[color],
      ].join(' ')}
    >
      {children}
    </span>
  )
}
