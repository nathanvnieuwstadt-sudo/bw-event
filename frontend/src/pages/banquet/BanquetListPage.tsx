import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBanquets } from '../../api/banquets'
import { useAuth } from '../../auth/useAuth'
import { BanquetTable } from '../../components/banquet/BanquetTable'
import { BanquetCalendar } from '../../components/banquet/BanquetCalendar'
import { Button } from '../../components/ui/Button'
import type { BanquetSummary } from '../../types/banquet'

type View = 'calendar' | 'table'

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex rounded-md border border-neutral-800 bg-neutral-900 p-0.5 shadow-card">
      <button
        onClick={() => onChange('calendar')}
        className={[
          'flex min-h-[40px] items-center gap-1.5 rounded px-4 py-2 text-sm font-medium transition-colors duration-100 active:scale-[0.97]',
          view === 'calendar' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-100',
        ].join(' ')}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="12" height="12" rx="1.5" />
          <path d="M2 7h12M5 2v2M11 2v2" />
        </svg>
        Calendrier
      </button>
      <button
        onClick={() => onChange('table')}
        className={[
          'flex min-h-[40px] items-center gap-1.5 rounded px-4 py-2 text-sm font-medium transition-colors duration-100 active:scale-[0.97]',
          view === 'table' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-100',
        ].join(' ')}
      >
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="14" height="10" rx="1" />
          <path d="M1 6h14M5 6v7M11 6v7" />
        </svg>
        Tableau
      </button>
    </div>
  )
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="5" />
      <path d="M14 14l-3-3" />
    </svg>
  )
}

export function BanquetListPage() {
  const { restaurantId, hasRole } = useAuth()
  const navigate = useNavigate()
  const [banquets, setBanquets] = useState<BanquetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('calendar')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!restaurantId) {
      setError('Aucun restaurant associé à ce compte.')
      setLoading(false)
      return
    }
    listBanquets(restaurantId)
      .then(setBanquets)
      .catch(() => setError('Impossible de charger les banquets.'))
      .finally(() => setLoading(false))
  }, [restaurantId])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? banquets.filter((b) =>
        (b.contactName ?? '').toLowerCase().includes(q) ||
        (b.contactOrganization ?? '').toLowerCase().includes(q)
      )
    : banquets

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Banquets</h1>
          {!loading && !error && (
            <p className="mt-0.5 text-sm text-neutral-500">
              {banquets.length} {banquets.length === 1 ? 'événement' : 'événements'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle view={view} onChange={setView} />
          {hasRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') && (
            <Button onClick={() => navigate('/banquets/new')}>Nouveau banquet</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-px overflow-hidden rounded-lg border border-neutral-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-neutral-800" />
          ))}
        </div>
      ) : !error ? (
        view === 'calendar' ? (
          <BanquetCalendar banquets={banquets} />
        ) : (
          <div className="space-y-3">
            <div className="relative max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <IconSearch />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un contact…"
                className="w-full min-h-[44px] rounded-md border border-neutral-700 bg-neutral-900 py-2.5 pl-9 pr-3 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>
            <BanquetTable banquets={filtered} />
          </div>
        )
      ) : null}
    </div>
  )
}
