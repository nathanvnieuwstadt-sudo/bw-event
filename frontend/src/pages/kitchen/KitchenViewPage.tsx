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
          <h1 className="text-lg font-semibold text-stone-900">Vue cuisine</h1>
          <p className="mt-0.5 text-sm text-stone-400">14 prochains jours</p>
        </div>
        {selected && (
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Imprimer
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex gap-5">
          <div className="w-56 space-y-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-md bg-stone-100" />
            ))}
          </div>
          <div className="flex-1 h-64 animate-pulse rounded-lg bg-stone-100" />
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Event list */}
          <div className="w-56 flex-none">
            {summaries.length === 0 ? (
              <div className="rounded-lg border border-stone-200 bg-white p-4 text-center text-sm text-stone-400">
                Aucun événement à venir.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-card divide-y divide-stone-100">
                {summaries.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => selectBanquet(b.id)}
                    className={[
                      'w-full px-4 py-3 text-left transition-colors duration-75',
                      selected?.id === b.id
                        ? 'bg-brand-50'
                        : 'hover:bg-stone-50 active:bg-stone-100',
                    ].join(' ')}
                  >
                    <div className={`text-sm font-medium ${selected?.id === b.id ? 'text-brand-700' : 'text-stone-800'}`}>
                      {formatDate(b.date)}
                    </div>
                    <div className="mt-0.5 text-xs text-stone-400">
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
              <div className="h-64 animate-pulse rounded-lg bg-stone-100" />
            ) : selected ? (
              <div className="rounded-lg border border-stone-200 bg-white shadow-card">
                {/* Event header */}
                <div className="flex items-start justify-between border-b border-stone-100 px-6 py-5">
                  <div>
                    <h2 className="text-base font-semibold text-stone-900">
                      {selected.contact?.name ?? 'Banquet'}
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                      {formatDate(selected.date)}
                      {selected.startTime && ` · ${selected.startTime.slice(0, 5)} – ${selected.endTime?.slice(0, 5)}`}
                      {' · '}
                      <span className="font-medium text-stone-700">{selected.headcount} invités</span>
                    </p>
                  </div>
                  <BanquetStatusBadge status={selected.status} />
                </div>

                {/* Dietary alert */}
                {selected.dietaryRestrictions && (
                  <div className="border-b border-amber-100 bg-amber-50 px-6 py-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-1">Restrictions alimentaires</p>
                    <p className="text-sm text-amber-800">{selected.dietaryRestrictions}</p>
                  </div>
                )}

                {/* Menu table */}
                <div className="px-6 py-5">
                  <p className="section-label mb-4">Menu</p>
                  {selected.menuItems.length === 0 ? (
                    <p className="text-sm text-stone-400">Aucun plat enregistré.</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-stone-100">
                          <th className="section-label pb-2.5 text-left">Plat</th>
                          <th className="section-label pb-2.5 text-right">Qté</th>
                          <th className="section-label pb-2.5 pl-6 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {selected.menuItems.map((item) => (
                          <tr key={item.id}>
                            <td className="py-2.5 text-sm font-medium text-stone-800">{item.dishName}</td>
                            <td className="py-2.5 text-right text-sm tabular-nums font-semibold text-stone-700">{item.quantity}</td>
                            <td className="py-2.5 pl-6 text-xs text-stone-400">{item.notes ?? ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Notes */}
                {selected.notes && (
                  <div className="border-t border-stone-100 px-6 py-4">
                    <p className="section-label mb-1.5">Notes</p>
                    <p className="text-sm text-stone-600">{selected.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-stone-200 text-sm text-stone-400">
                Sélectionnez un événement pour voir les détails
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
