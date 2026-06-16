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
    <div className="flex rounded-md border border-stone-200 bg-white p-0.5 shadow-card">
      <button
        onClick={() => onChange('calendar')}
        className={[
          'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors duration-100 active:scale-[0.97]',
          view === 'calendar' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900',
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
          'flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors duration-100 active:scale-[0.97]',
          view === 'table' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-900',
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

export function BanquetListPage() {
  const { restaurantId, hasRole } = useAuth()
  const navigate = useNavigate()
  const [banquets, setBanquets] = useState<BanquetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('calendar')

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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-stone-900">Banquets</h1>
          {!loading && !error && (
            <p className="mt-0.5 text-sm text-stone-400">
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
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-px overflow-hidden rounded-lg border border-stone-200">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-stone-100" />
          ))}
        </div>
      ) : !error ? (
        view === 'calendar'
          ? <BanquetCalendar banquets={banquets} />
          : <BanquetTable banquets={banquets} />
      ) : null}
    </div>
  )
}
