import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BanquetSummary, BanquetStatus } from '../../types/banquet'

interface Props {
  banquets: BanquetSummary[]
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const STATUS_DOT: Record<BanquetStatus, string> = {
  CONFIRMED: 'bg-green-500',
  DRAFT:     'bg-amber-400',
  CANCELLED: 'bg-red-400',
}

const STATUS_PILL: Record<BanquetStatus, string> = {
  CONFIRMED: 'bg-green-50 text-green-700 ring-green-200',
  DRAFT:     'bg-amber-50 text-amber-700 ring-amber-200',
  CANCELLED: 'bg-red-50 text-red-500 ring-red-200 line-through opacity-60',
}

const STATUS_LABEL: Record<BanquetStatus, string> = {
  CONFIRMED: 'Confirmé',
  DRAFT:     'Brouillon',
  CANCELLED: 'Annulé',
}

function formatTime(t: string | null) {
  return t ? t.slice(0, 5) : null
}

function buildGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = (firstDay.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startOffset)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
  }
  return days
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function isToday(d: Date): boolean {
  return isoDate(d) === isoDate(new Date())
}

export function BanquetCalendar({ banquets }: Props) {
  const navigate = useNavigate()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const grid = buildGrid(year, month)

  const byDate = banquets.reduce<Record<string, BanquetSummary[]>>((acc, b) => {
    if (!b.date) return acc
    if (!acc[b.date]) acc[b.date] = []
    acc[b.date].push(b)
    return acc
  }, {})

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function goToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="rounded-lg border border-stone-200 bg-white shadow-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors duration-75 hover:bg-stone-100 hover:text-stone-700 active:scale-[0.93]"
            aria-label="Mois précédent"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-md text-stone-400 transition-colors duration-75 hover:bg-stone-100 hover:text-stone-700 active:scale-[0.93]"
            aria-label="Mois suivant"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3l5 5-5 5" />
            </svg>
          </button>
          <h2 className="ml-1 text-sm font-semibold capitalize text-stone-800">{monthLabel}</h2>
        </div>
        <button
          onClick={goToday}
          className="rounded-md border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 transition-colors duration-75 hover:bg-stone-50 hover:text-stone-900 active:scale-[0.97]"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-stone-100">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2.5 text-center">
            <span className="section-label">{d}</span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 divide-x divide-stone-100">
        {grid.map((day, i) => {
          const key = isoDate(day)
          const inMonth = day.getMonth() === month
          const todayCell = isToday(day)
          const events = byDate[key] ?? []
          const isWeekend = day.getDay() === 0 || day.getDay() === 6

          return (
            <div
              key={i}
              className={[
                'min-h-[100px] border-b border-stone-100 p-1.5',
                !inMonth ? 'bg-stone-50/60' : isWeekend ? 'bg-stone-50/40' : 'bg-white',
              ].join(' ')}
            >
              <div className="mb-1 flex justify-end">
                <span
                  className={[
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    todayCell
                      ? 'bg-brand-600 text-white'
                      : inMonth
                      ? 'text-stone-700'
                      : 'text-stone-300',
                  ].join(' ')}
                >
                  {day.getDate()}
                </span>
              </div>

              <div className="space-y-0.5">
                {events.slice(0, 3).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => navigate(`/banquets/${b.id}`)}
                    className={[
                      'flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left ring-1 ring-inset',
                      'transition-opacity duration-75 hover:opacity-80 active:scale-[0.97]',
                      STATUS_PILL[b.status],
                    ].join(' ')}
                    title={`${b.contactName ?? 'Banquet'}${b.startTime ? ` · ${formatTime(b.startTime)}` : ''}`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[b.status]}`} />
                    <span className="truncate text-[11px] font-medium leading-tight">
                      {formatTime(b.startTime) && (
                        <span className="mr-1 font-normal opacity-70">{formatTime(b.startTime)}</span>
                      )}
                      {b.contactName ?? 'Banquet'}
                    </span>
                  </button>
                ))}
                {events.length > 3 && (
                  <p className="px-1.5 text-[10px] font-medium text-stone-400">
                    +{events.length - 3} autres
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 border-t border-stone-100 px-5 py-3">
        {(['CONFIRMED', 'DRAFT', 'CANCELLED'] as BanquetStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
            <span className="text-[11px] font-medium text-stone-400">
              {STATUS_LABEL[s]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
