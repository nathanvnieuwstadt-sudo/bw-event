import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useBanquetFilters } from './useBanquetFilters'
import { BanquetAgenda } from '../../components/banquet/BanquetAgenda'
import { BanquetFilterBar } from '../../components/banquet/BanquetFilterBar'
import { Button } from '../../components/ui/Button'

export function AgendaPage() {
  const { restaurantId, hasRole } = useAuth()
  const navigate = useNavigate()
  const {
    banquets, loading, error, filtered, filtersActive,
    search, setSearch,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    location, setLocation,
    minGuests, setMinGuests,
    maxGuests, setMaxGuests,
    resetFilters,
  } = useBanquetFilters(restaurantId)

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Agenda</h1>
          {!loading && !error && (
            <p className="mt-0.5 text-sm text-neutral-500">
              {banquets.length} {banquets.length === 1 ? 'événement' : 'événements'}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/banquets')}
            className="min-h-[44px] rounded-md border border-neutral-200 px-3.5 text-sm font-medium text-neutral-500 transition-colors duration-100 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            Calendrier / Tableau
          </button>
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
          <BanquetFilterBar
            search={search} onSearchChange={setSearch}
            dateFrom={dateFrom} onDateFromChange={setDateFrom}
            dateTo={dateTo} onDateToChange={setDateTo}
            location={location} onLocationChange={setLocation}
            minGuests={minGuests} onMinGuestsChange={setMinGuests}
            maxGuests={maxGuests} onMaxGuestsChange={setMaxGuests}
            filtersActive={filtersActive}
            onReset={resetFilters}
          />

          {filtersActive && (
            <p className="text-sm text-neutral-500">
              {filtered.length} {filtered.length === 1 ? 'résultat' : 'résultats'} sur {banquets.length}
            </p>
          )}

          <BanquetAgenda banquets={filtered} />
        </div>
      ) : null}
    </div>
  )
}
