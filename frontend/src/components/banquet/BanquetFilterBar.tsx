import { BANQUET_LOCATIONS, BANQUET_LOCATION_LABELS } from '../../types/banquet'
import type { BanquetLocation } from '../../types/banquet'

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

interface Props {
  search: string
  onSearchChange: (v: string) => void
  dateFrom: string
  onDateFromChange: (v: string) => void
  dateTo: string
  onDateToChange: (v: string) => void
  location: BanquetLocation | ''
  onLocationChange: (v: BanquetLocation | '') => void
  minGuests: string
  onMinGuestsChange: (v: string) => void
  maxGuests: string
  onMaxGuestsChange: (v: string) => void
  filtersActive: boolean
  onReset: () => void
}

export function BanquetFilterBar({
  search, onSearchChange,
  dateFrom, onDateFromChange,
  dateTo, onDateToChange,
  location, onLocationChange,
  minGuests, onMinGuestsChange,
  maxGuests, onMaxGuestsChange,
  filtersActive, onReset,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative w-full max-w-xs">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
          <IconSearch />
        </span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un contact…"
          className="w-full min-h-[44px] rounded-md border border-neutral-300 bg-white py-2.5 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Du</label>
        <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} className={selectCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Au</label>
        <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} className={selectCls} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-500">Lieu</label>
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value as BanquetLocation | '')}
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
          onChange={(e) => onMinGuestsChange(e.target.value)}
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
          onChange={(e) => onMaxGuestsChange(e.target.value)}
          placeholder="—"
          className={`${selectCls} w-24`}
        />
      </div>
      {filtersActive && (
        <button
          onClick={onReset}
          className="min-h-[44px] rounded-md px-3 text-sm font-medium text-neutral-500 transition-colors duration-100 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          Réinitialiser
        </button>
      )}
    </div>
  )
}
