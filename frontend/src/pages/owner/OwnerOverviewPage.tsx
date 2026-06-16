import { useEffect, useState } from 'react'
import { listBanquets } from '../../api/banquets'
import { useAuth } from '../../auth/useAuth'
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
  { label: 'Confirmé',  status: 'CONFIRMED' as BanquetStatus, accent: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
  { label: 'Brouillon', status: 'DRAFT'     as BanquetStatus, accent: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
  { label: 'Annulé',    status: 'CANCELLED' as BanquetStatus, accent: 'text-red-600',   bg: 'bg-red-50',   border: 'border-red-100'   },
]

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
        <h1 className="text-lg font-semibold text-stone-900">Vue d'ensemble</h1>
        {!loading && (
          <p className="mt-0.5 text-sm text-stone-400">{banquets.length} événements au total</p>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-stone-100" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-lg bg-stone-100" />
        </div>
      ) : (
        <>
          {/* Stat tiles */}
          <div className="mb-6 grid grid-cols-3 gap-4">
            {stats.map(({ label, status, accent, bg, border }) => (
              <div
                key={status}
                className={`rounded-lg border ${border} ${bg} px-5 py-4`}
              >
                <p className="section-label text-stone-400">{label}</p>
                <p className={`mt-2 text-3xl font-bold tabular-nums tracking-tight ${accent}`}>
                  {count(banquets, status)}
                </p>
              </div>
            ))}
          </div>

          {/* Banquet list */}
          <div className="flex items-center gap-3 mb-3">
            <span className="section-label">Tous les événements</span>
            <div className="flex-1 border-t border-stone-200" />
          </div>
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-card divide-y divide-stone-100">
            {banquets.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-stone-400">Aucun banquet trouvé.</p>
            )}
            {banquets.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-stone-800">{b.contactName ?? '—'}</span>
                  {b.contactOrganization && (
                    <span className="ml-2 text-sm text-stone-400">{b.contactOrganization}</span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-5 text-sm">
                  <span className="text-stone-400">{formatDate(b.date)}</span>
                  <span className="tabular-nums text-stone-500">
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
