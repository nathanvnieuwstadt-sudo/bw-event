import { useEffect, useState } from 'react'
import { listUpcomingBanquets, getBanquet } from '../../api/banquets'
import { useAuth } from '../../auth/useAuth'
import { BanquetStatusBadge } from '../../components/banquet/BanquetStatusBadge'
import { Button } from '../../components/ui/Button'
import type { Banquet, BanquetSummary } from '../../types/banquet'

function formatDate(d: string | null) {
  if (!d) return '(sans date)'
  return new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function KitchenViewPage() {
  const { restaurantId } = useAuth()
  const [summaries, setSummaries] = useState<BanquetSummary[]>([])
  const [selected, setSelected] = useState<Banquet | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    if (!restaurantId) { setLoading(false); return }
    listUpcomingBanquets(restaurantId, 14)
      .then((list) => {
        setSummaries(list)
        if (list.length > 0 && restaurantId) {
          setDetailLoading(true)
          getBanquet(restaurantId, list[0].id)
            .then(setSelected)
            .finally(() => setDetailLoading(false))
        }
      })
      .finally(() => setLoading(false))
  }, [restaurantId])

  async function selectBanquet(id: string) {
    if (!restaurantId) return
    setDetailLoading(true)
    const b = await getBanquet(restaurantId, id)
    setSelected(b)
    setDetailLoading(false)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Vue cuisine</h1>
          <p className="mt-0.5 text-sm text-neutral-500">14 prochains jours</p>
        </div>
        {selected && (
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Imprimer
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="w-full space-y-1.5 md:w-56">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-md bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
          <div className="flex-1 h-64 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        </div>
      ) : (
        <div className="flex flex-col gap-5 md:flex-row">
          {/* Event list */}
          <div className="w-full md:w-56 md:flex-none">
            {summaries.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 bg-white p-4 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                Aucun événement à venir.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-card divide-y divide-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:divide-neutral-800 md:max-h-none md:overflow-visible">
                {summaries.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => selectBanquet(b.id)}
                    className={[
                      'w-full px-4 py-3 text-left transition-colors duration-75',
                      selected?.id === b.id
                        ? 'bg-brand-500/10'
                        : 'hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-950 dark:active:bg-neutral-800',
                    ].join(' ')}
                  >
                    <div className={`text-sm font-medium ${selected?.id === b.id ? 'text-brand-600 dark:text-brand-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {formatDate(b.date)}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {b.contactName ?? 'Inconnu'} · {b.headcount ?? '?'} invités
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Event detail */}
          <div className="flex-1">
            {detailLoading ? (
              <div className="h-64 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            ) : selected ? (
              <div className="rounded-lg border border-neutral-200 bg-white shadow-card dark:border-neutral-800 dark:bg-neutral-900">
                {/* Event header */}
                <div className="flex items-start justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
                  <div>
                    <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                      {selected.contact?.name ?? 'Banquet'}
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {formatDate(selected.date)}
                      {selected.startTime && ` · ${selected.startTime.slice(0, 5)} – ${selected.endTime?.slice(0, 5)}`}
                      {' · '}
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{selected.headcount} invités</span>
                    </p>
                  </div>
                  <BanquetStatusBadge status={selected.status} />
                </div>

                {/* Dietary alert */}
                {selected.dietaryRestrictions && (
                  <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-1">Restrictions alimentaires</p>
                    <p className="text-sm text-amber-800 dark:text-amber-300">{selected.dietaryRestrictions}</p>
                  </div>
                )}

                {/* Menu table */}
                <div className="px-6 py-5">
                  <p className="section-label mb-4">Menu</p>
                  {selected.menuItems.length === 0 ? (
                    <p className="text-sm text-neutral-500">Aucun plat enregistré.</p>
                  ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800">
                          <th className="section-label pb-2.5 text-left">Plat</th>
                          <th className="section-label pb-2.5 text-right">Qté</th>
                          <th className="section-label pb-2.5 pl-6 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-950">
                        {selected.menuItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-200">{item.dishName}</td>
                            <td className="py-2.5 text-right text-sm tabular-nums font-semibold text-neutral-700 dark:text-neutral-300">{item.quantity}</td>
                            <td className="py-2.5 pl-6 text-xs text-neutral-500">{item.notes ?? ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
                    <p className="section-label mb-1.5">Notes</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{selected.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-500 dark:border-neutral-800">
                Sélectionnez un événement pour voir les détails
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
