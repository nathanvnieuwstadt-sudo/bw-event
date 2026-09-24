import { useEffect, useMemo, useState } from 'react'
import { listBanquets } from '../../api/banquets'
import { useAuth } from '../../auth/useAuth'
import { useTheme } from '../../theme/useTheme'
import { BanquetStatusBadge } from '../../components/banquet/BanquetStatusBadge'
import type { BanquetSummary, BanquetStatus } from '../../types/banquet'

function count(banquets: BanquetSummary[], status: BanquetStatus): number {
  return banquets.filter((b) => b.status === status).length
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const stats = [
  { label: 'Confirmé',  status: 'CONFIRMED' as BanquetStatus, accent: 'text-green-700 dark:text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { label: 'Brouillon', status: 'DRAFT'     as BanquetStatus, accent: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: 'Annulé',    status: 'CANCELLED' as BanquetStatus, accent: 'text-red-700 dark:text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20'   },
]

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

type Grouping = 'week' | 'month'

function buildBuckets(banquets: BanquetSummary[], grouping: Grouping): { label: string; value: number }[] {
  const labels = grouping === 'week' ? WEEKDAYS : MONTHS
  const counts = new Array(labels.length).fill(0)
  for (const b of banquets) {
    if (!b.date) continue
    const d = new Date(b.date)
    const idx = grouping === 'week' ? (d.getDay() + 6) % 7 : d.getMonth()
    counts[idx]++
  }
  return labels.map((label, i) => ({ label, value: counts[i] }))
}

const DONUT_SEGMENTS: { status: BanquetStatus; color: string; dot: string }[] = [
  { status: 'CONFIRMED', color: '#4ade80', dot: 'bg-green-400' },
  { status: 'DRAFT',     color: '#fbbf24', dot: 'bg-amber-400' },
  { status: 'CANCELLED', color: '#f87171', dot: 'bg-red-400' },
]

function StatusDonut({ banquets }: { banquets: BanquetSummary[] }) {
  const { theme } = useTheme()
  const total = banquets.length
  const counts = DONUT_SEGMENTS.map((s) => count(banquets, s.status))

  let acc = 0
  const stops: string[] = []
  DONUT_SEGMENTS.forEach((seg, i) => {
    const value = counts[i]
    const start = total > 0 ? (acc / total) * 360 : 0
    acc += value
    const end = total > 0 ? (acc / total) * 360 : 0
    stops.push(`${seg.color} ${start}deg ${end}deg`)
  })

  const emptyColor = theme === 'dark' ? '#262626' : '#e5e5e5'
  const gradient = total > 0
    ? `conic-gradient(${stops.join(', ')})`
    : `conic-gradient(${emptyColor} 0deg 360deg)`

  return (
    <div className="flex items-center gap-6">
      <div
        className="relative h-32 w-32 shrink-0 rounded-full"
        style={{ background: gradient }}
      >
        <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white dark:bg-neutral-900">
          <span className="text-xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">{total}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-neutral-500">Total</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {DONUT_SEGMENTS.map((seg, i) => (
          <div key={seg.status} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${seg.dot}`} />
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {seg.status === 'CONFIRMED' ? 'Confirmé' : seg.status === 'DRAFT' ? 'Brouillon' : 'Annulé'}
            </span>
            <span className="ml-auto text-xs font-semibold tabular-nums text-neutral-800 dark:text-neutral-200">{counts[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function BarChart({ banquets }: { banquets: BanquetSummary[] }) {
  const [grouping, setGrouping] = useState<Grouping>('week')
  const buckets = useMemo(() => buildBuckets(banquets, grouping), [banquets, grouping])
  const max = Math.max(1, ...buckets.map((b) => b.value))

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Répartition des événements</h2>
        <div className="flex rounded-md border border-neutral-200 bg-neutral-50 p-0.5 dark:border-neutral-800 dark:bg-neutral-950">
          {(['week', 'month'] as Grouping[]).map((g) => (
            <button
              key={g}
              onClick={() => setGrouping(g)}
              className={[
                'min-h-[36px] rounded px-3.5 py-1.5 text-xs font-medium transition-colors duration-100',
                grouping === g ? 'bg-brand-600 text-white' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200',
              ].join(' ')}
            >
              {g === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-40 items-end gap-2">
        {buckets.map((b) => (
          <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-32 w-full items-end">
              <div
                className="w-full rounded-t-sm bg-brand-500 transition-all duration-300"
                style={{ height: `${Math.max(3, (b.value / max) * 100)}%` }}
                title={`${b.value}`}
              />
            </div>
            <span className="text-[10px] font-medium text-neutral-500">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OwnerOverviewPage() {
  const { restaurantId } = useAuth()
  const [banquets, setBanquets] = useState<BanquetSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId) { setLoading(false); return }
    listBanquets(restaurantId)
      .then(setBanquets)
      .finally(() => setLoading(false))
  }, [restaurantId])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Vue d'ensemble</h1>
        {!loading && (
          <p className="mt-0.5 text-sm text-neutral-500">{banquets.length} événements au total</p>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900" />
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map(({ label, status, accent, bg, border }) => (
              <div
                key={status}
                className={`rounded-lg border ${border} ${bg} px-5 py-4`}
              >
                <p className="section-label text-neutral-500">{label}</p>
                <p className={`mt-2 text-3xl font-bold tabular-nums tracking-tight ${accent}`}>
                  {count(banquets, status)}
                </p>
              </div>
            ))}
          </div>

          {/* Chart + donut */}
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
              <BarChart banquets={banquets} />
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-card dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="mb-5 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Statuts</h2>
              <StatusDonut banquets={banquets} />
            </div>
          </div>

          {/* Banquet list */}
          <div className="flex items-center gap-3 mb-3">
            <span className="section-label">Tous les événements</span>
            <div className="flex-1 border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-card divide-y divide-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:divide-neutral-800">
            {banquets.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-neutral-500">Aucun banquet trouvé.</p>
            )}
            {banquets.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{b.contactName ?? '—'}</span>
                  {b.contactOrganization && (
                    <span className="ml-2 text-sm text-neutral-500">{b.contactOrganization}</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm sm:shrink-0 sm:gap-5">
                  <span className="text-neutral-500">{formatDate(b.date)}</span>
                  <span className="tabular-nums text-neutral-500 dark:text-neutral-400">
                    {b.headcount != null ? `${b.headcount} invités` : '—'}
                  </span>
                  <BanquetStatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
