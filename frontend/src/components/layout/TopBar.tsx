import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

function IconHome() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L10 3l7 6.5" />
      <path d="M5 8v9h4v-4h2v4h4V8" />
    </svg>
  )
}

export function TopBar() {
  const { email, clearAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === '/'

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6">
      <div>
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-neutral-400 transition-colors duration-100 hover:bg-neutral-800 hover:text-neutral-100 active:scale-[0.97] active:bg-neutral-800"
          >
            <IconHome />
            Accueil
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-neutral-400 sm:inline">{email}</span>
        <div className="hidden h-4 w-px bg-neutral-800 sm:block" />
        <button
          onClick={handleLogout}
          className="flex min-h-[44px] items-center rounded-lg px-3.5 text-sm font-medium text-neutral-400 transition-colors duration-100 hover:bg-neutral-800 hover:text-neutral-100 active:scale-[0.97] active:bg-neutral-800"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  )
}
