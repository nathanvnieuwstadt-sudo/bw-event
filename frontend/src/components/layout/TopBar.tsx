import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { ThemeToggle } from '../../theme/ThemeToggle'

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L10 3l7 6.5" />
      <path d="M5 8v9h4v-4h2v4h4V8" />
    </svg>
  )
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H4.5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1H8" />
      <path d="M13 14l4-4-4-4" />
      <path d="M17 10H7" />
    </svg>
  )
}

interface Props {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: Props) {
  const { email, clearAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          aria-label="Ouvrir le menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-100 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 lg:hidden"
        >
          <IconMenu />
        </button>
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="flex min-h-[44px] items-center gap-2 rounded-lg px-2.5 sm:px-3 text-sm font-medium text-neutral-500 transition-colors duration-100 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] active:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-800"
          >
            <IconHome />
            <span className="hidden sm:inline">Accueil</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <span className="hidden text-sm text-neutral-500 sm:inline dark:text-neutral-400">{email}</span>
        <div className="hidden h-4 w-px bg-neutral-200 sm:block dark:bg-neutral-800" />
        <ThemeToggle />
        <button
          onClick={handleLogout}
          aria-label="Se déconnecter"
          className="flex min-h-[44px] items-center gap-1.5 rounded-lg px-2.5 sm:px-3.5 text-sm font-medium text-neutral-500 transition-colors duration-100 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] active:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:active:bg-neutral-800"
        >
          <IconLogout />
          <span className="hidden sm:inline">Se déconnecter</span>
        </button>
      </div>
    </header>
  )
}
