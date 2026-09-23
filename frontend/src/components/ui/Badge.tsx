import type { ReactNode } from 'react'

type Color = 'stone' | 'green' | 'amber' | 'red' | 'blue'

interface Props {
  color?: Color
  children: ReactNode
}

const colorClasses: Record<Color, string> = {
  stone: 'bg-neutral-100 text-neutral-600 ring-neutral-300 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-700',
  green: 'bg-green-500/10 text-green-700 ring-green-500/30 dark:text-green-400',
  amber: 'bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-400',
  red:   'bg-red-500/10 text-red-700 ring-red-500/30 dark:text-red-400',
  blue:  'bg-brand-500/10 text-brand-700 ring-brand-500/30 dark:text-brand-400',
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
