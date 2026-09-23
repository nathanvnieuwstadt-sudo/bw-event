import { useTheme } from './useTheme'

function IconSun() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="4" />
      <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.8 4.2l-1.4 1.4M5.6 14.4l-1.4 1.4M15.8 15.8l-1.4-1.4M5.6 5.6L4.2 4.2" />
    </svg>
  )
}

function IconMoon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 11.5A7.5 7.5 0 018.5 3a7.5 7.5 0 108.5 8.5z" />
    </svg>
  )
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
      title={isDark ? 'Thème clair' : 'Thème sombre'}
      className={[
        'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg',
        'text-neutral-500 transition-colors duration-100',
        'hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97]',
        'dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100',
        className,
      ].join(' ')}
    >
      {isDark ? <IconSun /> : <IconMoon />}
    </button>
  )
}
