import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

interface NavCard {
  label: string
  description: string
  to: string
  icon: React.ReactNode
}

function IconCalendar() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="14" height="13" rx="2" />
      <path d="M3 9h14" />
      <path d="M7 3v4M13 3v4" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="7" r="3" />
      <path d="M1 17c0-3 2.91-5.5 6.5-5.5" />
      <circle cx="14" cy="9" r="2.5" />
      <path d="M11 17c0-2.5 1.343-4.5 3-4.5h.5" />
    </svg>
  )
}

function IconBot() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="11" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="11" width="6" height="6" rx="1" />
      <rect x="11" y="11" width="6" height="6" rx="1" />
    </svg>
  )
}

function IconTag() {
  return (
    <svg width="28" height="28" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h6l8 8a2 2 0 0 1 0 2.83l-3.17 3.17a2 2 0 0 1-2.83 0L3 9V3z" />
      <circle cx="7" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

const allCards: Record<string, NavCard> = {
  eventTypes: {
    label: 'Types d\'événements',
    description: 'Définissez les types d\'événements que vous organisez et les informations nécessaires pour chacun.',
    to: '/event-types',
    icon: <IconTag />,
  },
  banquets: {
    label: 'Banquets',
    description: 'Créez et gérez les réservations de banquets, suivez les statuts et consultez les détails.',
    to: '/banquets',
    icon: <IconCalendar />,
  },
  contacts: {
    label: 'Contacts',
    description: 'Gérez les contacts clients liés aux événements.',
    to: '/contacts',
    icon: <IconUsers />,
  },
  kitchen: {
    label: 'Vue cuisine',
    description: 'Vue en lecture seule des banquets confirmés et des menus pour l\'équipe cuisine.',
    to: '/kitchen',
    icon: <IconCutlery />,
  },
  overview: {
    label: 'Vue d\'ensemble',
    description: 'Rapports et résumés financiers pour la direction.',
    to: '/overview',
    icon: <IconGrid />,
  },
  agent: {
    label: 'Agent',
    description: 'Consultez et approuvez les brouillons de réponses générés par l\'IA.',
    to: '/agent',
    icon: <IconBot />,
  },
}

const roleCardKeys: Record<string, string[]> = {
  DEV:             ['banquets', 'contacts', 'eventTypes', 'kitchen', 'overview', 'agent'],
  GENERAL_MANAGER: ['banquets', 'contacts', 'eventTypes', 'agent'],
  FLOOR_MANAGER:   ['banquets', 'contacts', 'agent'],
  OWNER:           ['banquets', 'overview'],
  KITCHEN:         ['kitchen'],
}

export function DashboardPage() {
  const { role, email } = useAuth()
  const navigate = useNavigate()

  const cardKeys = roleCardKeys[role ?? ''] ?? ['banquets']
  const cards = cardKeys.map((k) => allCards[k]).filter(Boolean)

  const greeting = email ? `Bienvenue, ${email.split('@')[0]}` : 'Bienvenue'

  return (
    <div className="mx-auto max-w-3xl py-12 px-4">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-stone-900">{greeting}</h1>
        <p className="mt-1 text-sm text-stone-500">Où souhaitez-vous aller ?</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <button
            key={card.to}
            onClick={() => navigate(card.to)}
            className="group flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-5 text-left shadow-sm transition-all duration-150 hover:border-slate-400 hover:shadow-md active:scale-[0.98]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors duration-150 group-hover:bg-slate-900 group-hover:text-white">
              {card.icon}
            </div>
            <div className="pt-0.5">
              <p className="text-sm font-semibold text-stone-900">{card.label}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-stone-500">{card.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
