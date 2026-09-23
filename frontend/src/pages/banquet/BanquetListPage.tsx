import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBanquets } from '../../api/banquets'
import { useAuth } from '../../auth/useAuth'
import { BanquetTable } from '../../components/banquet/BanquetTable'
import { BanquetCalendar } from '../../components/banquet/BanquetCalendar'
import { Button } from '../../components/ui/Button'
import { BANQUET_LOCATIONS, BANQUET_LOCATION_LABELS } from '../../types/banquet'
import type { BanquetLocation, BanquetSummary } from '../../types/banquet'

type View = 'calendar' | 'table'

function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex rounded-md border border-neutral-200 bg-white p-0.5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
      <button
        onClick={() => onChange('calendar')}
        className={[
          'flex min-h-[40px] items-center gap-1.5 rounded px-4 py-2 text-sm font-medium transition-colors duration-100 active:scale-[0.97]',
          view === 'calendar'
            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
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
          view === 'table'
            ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
            : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100',
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

const selectCls =
  'min-h-[44px] rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'

export function BanquetListPage() {
  const { restaurantId, hasRole } = useAuth()
  const navigate = useNavigate()
  const [banquets, setBanquets] = useState<BanquetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<View>('calendar')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [location, setLocation] = useState<BanquetLocation | ''>('')
  const [minGuests, setMinGuests] = useState('')
  const [maxGuests, setMaxGuests] = useState('')

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

  const filtersActive = Boolean(search || dateFrom || dateTo || location || minGuests || maxGuests)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const min = minGuests ? Number(minGuests) : null
    const max = maxGuests ? Number(maxGuests) : null
    return banquets.filter((b) => {
      if (q && !(b.contactName ?? '').toLowerCase().includes(q) &&
          !(b.contactOrganization ?? '').toLowerCase().includes(q)) return false
      if (dateFrom && (!b.date || b.date < dateFrom)) return false
      if (dateTo && (!b.date || b.date > dateTo)) return false
      if (location && b.location !== location) return false
      if (min != null && (b.headcount == null || b.headcount < min)) return false
      if (max != null && (b.headcount == null || b.headcount > max)) return false
      return true
    })
  }, [banquets, search, dateFrom, dateTo, location, minGuests, maxGuests])

  function resetFilters() {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setLocation('')
    setMinGuests('')
    setMaxGuests('')
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Banquets</h1>
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
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-px overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      ) : !error ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="relative w-full max-w-xs">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <IconSearch />
              </span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un contact…"
                className="w-full min-h-[44px] rounded-md border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Du</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={selectCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Au</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={selectCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Lieu</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as BanquetLocation | '')}
                className={selectCls}
              >
                <option value="">Tous</option>
                {BANQUET_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{BANQUET_LOCATION_LABELS[loc]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Invités min.</label>
              <input
                type="number"
                min={0}
                value={minGuests}
                onChange={(e) => setMinGuests(e.target.value)}
                placeholder="0"
                className={`${selectCls} w-24`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Invités max.</label>
              <input
                type="number"
                min={0}
                value={maxGuests}
                onChange={(e) => setMaxGuests(e.target.value)}
                placeholder="—"
                className={`${selectCls} w-24`}
              />
            </div>
            {filtersActive && (
              <button
                onClick={resetFilters}
                className="min-h-[44px] rounded-md px-3 text-sm font-medium text-neutral-500 transition-colors duration-100 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {filtersActive && (
            <p className="text-sm text-neutral-500">
              {filtered.length} {filtered.length === 1 ? 'résultat' : 'résultats'} sur {banquets.length}
            </p>
          )}

          {view === 'calendar' ? (
            <BanquetCalendar banquets={filtered} />
          ) : (
            <BanquetTable banquets={filtered} />
          )}
        </div>
      ) : null}
    </div>
  )
}
