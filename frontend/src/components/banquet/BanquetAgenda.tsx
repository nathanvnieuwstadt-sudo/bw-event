import { useNavigate } from 'react-router-dom'
import { BanquetStatusBadge } from './BanquetStatusBadge'
import { BANQUET_LOCATION_LABELS } from '../../types/banquet'
import type { BanquetSummary } from '../../types/banquet'

interface Props {
  banquets: BanquetSummary[]
}

function formatTime(t: string | null): string {
  return t ? t.slice(0, 5) : ''
}

function formatDateHeader(iso: string): string {
  const label = new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function BanquetAgenda({ banquets }: Props) {
  const navigate = useNavigate()
  const today = todayIso()

  const dated = banquets.filter((b) => b.date)
  const undatedCount = banquets.length - dated.length

  // banquets already arrive sorted by date/time from the API, so grouping
  // preserves that order without needing to re-sort here.
  const groups = new Map<string, BanquetSummary[]>()
  for (const b of dated) {
    const key = b.date as string
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(b)
  }
  const dates = Array.from(groups.keys())

  if (dated.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Aucun événement daté à afficher.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {undatedCount > 0 && (
        <p className="text-xs text-neutral-500">
          {undatedCount} événement{undatedCount !== 1 ? 's' : ''} sans date — visible{undatedCount !== 1 ? 's' : ''} dans la vue Tableau.
        </p>
      )}
      {dates.map((date) => {
        const events = groups.get(date)!
        const isToday = date === today
        return (
          <div key={date}>
            <div className="mb-2 flex items-center gap-2">
              <h3
                className={[
                  'text-sm font-semibold capitalize',
                  isToday ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200',
                ].join(' ')}
              >
                {formatDateHeader(date)}
              </h3>
              {isToday && (
                <span className="rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                  Aujourd'hui
                </span>
              )}
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-card divide-y divide-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:divide-neutral-800">
              {events.map((b) => (
                <button
                  key={b.id}
                  onClick={() => navigate(`/banquets/${b.id}`)}
                  className="flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors duration-75 hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-950 dark:active:bg-neutral-800 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="w-full shrink-0 text-sm font-medium tabular-nums text-neutral-500 dark:text-neutral-400 sm:w-24">
                    {b.startTime
                      ? `${formatTime(b.startTime)}${b.endTime ? ` – ${formatTime(b.endTime)}` : ''}`
                      : '—'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {b.contactName ?? 'Sans contact'}
                      {b.contactOrganization && (
                        <span className="font-normal text-neutral-500"> — {b.contactOrganization}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-3 text-xs text-neutral-500">
                    {b.location && <span>{BANQUET_LOCATION_LABELS[b.location]}</span>}
                    {b.headcount != null && <span>{b.headcount} invités</span>}
                    <BanquetStatusBadge status={b.status} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
