import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L10 3l7 6.5" />
      <path d="M5 8v9h4v-4h2v4h4V8" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="14" height="13" rx="2" />
      <path d="M3 9h14" />
      <path d="M7 3v4M13 3v4" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7" r="3" />
      <path d="M1 17c0-3 2.91-5.5 6.5-5.5" />
      <circle cx="14" cy="9" r="2.5" />
      <path d="M11 17c0-2.5 1.343-4.5 3-4.5h.5" />
    </svg>
  )
}

function IconBot() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="14" height="10" rx="2" />
      <path d="M7 8V6a3 3 0 0 1 6 0v2" />
      <circle cx="7.5" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M8.5 16h3" />
    </svg>
  )
}

function IconCutlery() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v5a3 3 0 0 1-3 3h0v6" />
      <path d="M7 3H5M7 3H9" />
      <path d="M7 8V3" />
      <path d="M14 3v14" />
      <path d="M14 3a3 3 0 0 1 3 3v2h-3" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h4v4H3zM3 11h4v4H3zM9 5h4v4H9zM9 11h4v4H9zM15 5h2v4h-2zM15 11h2v4h-2z" />
    </svg>
  )
}

function IconRules() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h12M4 10h8M4 14h5" />
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h6l8 8a2 2 0 0 1 0 2.83l-3.17 3.17a2 2 0 0 1-2.83 0L3 9V3z" />
      <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const HOME: NavItem = { label: 'Accueil', to: '/', icon: <IconHome /> }

const managerItems: NavItem[] = [
  { label: 'Banquets',          to: '/banquets',     icon: <IconCalendar /> },
  { label: 'Contacts',          to: '/contacts',     icon: <IconUsers /> },
  { label: 'Boîte de l\'agent', to: '/agent',        icon: <IconBot /> },
  { label: 'Règles de l\'agent',to: '/agent/rules',  icon: <IconRules /> },
]

const kitchenItems: NavItem[] = [
  { label: 'Cuisine',           to: '/kitchen',      icon: <IconCutlery /> },
]

const ownerItems: NavItem[] = [
  { label: 'Vue d\'ensemble',   to: '/overview',     icon: <IconGrid /> },
]

const devItems: NavItem[] = [
  { label: 'Banquets',          to: '/banquets',     icon: <IconCalendar /> },
  { label: 'Contacts',          to: '/contacts',     icon: <IconUsers /> },
  { label: 'Types d\'événements', to: '/event-types', icon: <IconTag /> },
  { label: 'Cuisine',           to: '/kitchen',      icon: <IconCutlery /> },
  { label: 'Vue d\'ensemble',   to: '/overview',     icon: <IconGrid /> },
  { label: 'Boîte de l\'agent', to: '/agent',        icon: <IconBot /> },
  { label: 'Règles de l\'agent',to: '/agent/rules',  icon: <IconRules /> },
]

const ROLE_LABELS: Record<string, string> = {
  DEV:             'DEV',
  OWNER:           'Propriétaire',
  GENERAL_MANAGER: 'Directeur général',
  FLOOR_MANAGER:   'Responsable de salle',
  KITCHEN:         'Cuisine',
}

export function Sidebar() {
  const { role, email } = useAuth()

  const roleItems =
    role === 'DEV'
      ? devItems
      : role === 'KITCHEN'
      ? kitchenItems
      : role === 'OWNER'
      ? ownerItems
      : managerItems

  const initial = email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="flex h-full w-60 flex-col bg-neutral-950">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-neutral-800 px-5">
        <Link
          to="/"
          className="text-[13px] font-semibold tracking-[0.08em] text-neutral-100 uppercase hover:text-neutral-300 transition-colors duration-100"
        >
          BW Event
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5 mb-4">
          <li>
            <NavLink
              to={HOME.to}
              end
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100',
                  isActive
                    ? 'bg-neutral-800 text-neutral-100'
                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100',
                ].join(' ')
              }
            >
              {HOME.icon}
              {HOME.label}
            </NavLink>
          </li>
        </ul>

        <p className="section-label mb-3 px-3 text-neutral-600">Navigation</p>
        <ul className="space-y-0.5">
          {roleItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-100',
                    isActive
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100',
                  ].join(' ')
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User / role footer */}
      <div className="flex items-center gap-2.5 border-t border-neutral-800 px-4 py-3.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-semibold text-white">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-neutral-300">{email}</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-600">
            {ROLE_LABELS[role ?? ''] ?? role}
          </p>
        </div>
      </div>
    </aside>
  )
}
