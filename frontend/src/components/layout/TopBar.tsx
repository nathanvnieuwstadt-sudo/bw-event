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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-6">
      <div>
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-neutral-400 transition-colors duration-100 hover:text-neutral-100 active:scale-[0.97]"
          >
            <IconHome />
            Accueil
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-400">{email}</span>
        <div className="h-4 w-px bg-neutral-800" />
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-400 transition-colors duration-100 hover:text-neutral-100 active:scale-[0.97]"
        >
          Se déconnecter
        </button>
      </div>
    </header>
  )
}
