import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteBanquet, getBanquet } from '../../api/banquets'
import { useAuth } from '../../auth/useAuth'
import { BanquetStatusBadge } from '../../components/banquet/BanquetStatusBadge'
import { Button } from '../../components/ui/Button'
import type { Banquet } from '../../types/banquet'

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="text-sm text-neutral-200">
        {value != null && value !== '' ? value : <span className="text-neutral-700">—</span>}
      </dd>
    </div>
  )
}

export function BanquetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { restaurantId, hasRole } = useAuth()
  const navigate = useNavigate()
  const [banquet, setBanquet] = useState<Banquet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!restaurantId || !id) return
    getBanquet(restaurantId, id)
      .then(setBanquet)
      .finally(() => setLoading(false))
  }, [restaurantId, id])

  async function handleDelete() {
    if (!restaurantId || !id) return
    if (!confirm('Supprimer ce banquet ? Cette action est irréversible.')) return
    await deleteBanquet(restaurantId, id)
    navigate('/banquets')
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-8">
        <div className="h-8 w-56 animate-pulse rounded bg-neutral-800" />
        <div className="h-72 animate-pulse rounded-xl bg-neutral-800" />
      </div>
    )
  }

  if (!banquet) {
    return <div className="text-sm text-red-500">Banquet introuvable.</div>
  }

  const timeValue =
    banquet.startTime && banquet.endTime
      ? `${banquet.startTime.slice(0, 5)} – ${banquet.endTime.slice(0, 5)}`
      : null

  const depositValue = banquet.depositPaid
    ? `Reçu${banquet.depositAmount != null ? ` — ${Number(banquet.depositAmount).toLocaleString('fr-FR')} €` : ''}`
    : 'Non reçu'

  return (
    <div className="mx-auto max-w-4xl py-6 px-4">
      {/* Page header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/banquets')}
            className="mb-2 flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-300"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4L6 10l6 6" />
            </svg>
            Banquets
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-neutral-100">
              {banquet.contact?.name ?? 'Banquet sans nom'}
            </h1>
            <BanquetStatusBadge status={banquet.status} />
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-neutral-400">
            {banquet.date && <span>{banquet.date}</span>}
            {banquet.eventType && (
              <>
                {banquet.date && <span className="text-neutral-700">·</span>}
                <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-xs font-medium text-neutral-400">
                  {banquet.eventType.name}
                </span>
              </>
            )}
          </div>
        </div>

        {hasRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER') && (
          <div className="flex shrink-0 gap-2 pt-1">
            <Button variant="secondary" size="sm" onClick={() => navigate(`/banquets/${id}/edit`)}>
              Modifier
            </Button>
            {hasRole('DEV', 'GENERAL_MANAGER') && (
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Supprimer
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Event details */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
          <div className="border-b border-neutral-800 px-6 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Détails de l'événement</h2>
          </div>
          <dl className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3">
            <Field label="Date" value={banquet.date} />
            <Field label="Horaire" value={timeValue} />
            <Field label="Invités" value={banquet.headcount} />
            <Field
              label="Budget"
              value={banquet.budget != null ? `${Number(banquet.budget).toLocaleString('fr-FR')} €` : null}
            />
            <Field label="Configuration de la salle" value={banquet.roomSetup} />
            <Field label="Source" value={banquet.source} />
          </dl>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
          <div className="border-b border-neutral-800 px-6 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Contact</h2>
          </div>
          <dl className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-4">
            <Field label="Nom" value={banquet.contact?.name} />
            <Field label="Organisation" value={banquet.contact?.organization} />
            <Field label="E-mail" value={banquet.contact?.email} />
            <Field label="Téléphone" value={banquet.contact?.phone} />
          </dl>
        </div>

        {/* Requirements */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
          <div className="border-b border-neutral-800 px-6 py-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Exigences</h2>
          </div>
          <dl className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3">
            <Field label="Restrictions alimentaires" value={banquet.dietaryRestrictions} />
            <Field label="Besoins audiovisuels" value={banquet.avNeeds} />
            <Field label="Acompte" value={depositValue} />
          </dl>
        </div>

        {/* Event type custom fields */}
        {banquet.eventType && banquet.eventType.fields.length > 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
            <div className="border-b border-neutral-800 px-6 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                Détails — {banquet.eventType.name}
              </h2>
            </div>
            <dl className="grid grid-cols-2 gap-6 p-6 sm:grid-cols-3">
              {banquet.eventType.fields.map((field) => {
                const raw = banquet.fieldValues?.[field.id]
                const display =
                  field.fieldType === 'BOOLEAN'
                    ? raw === 'true' ? 'Oui' : raw === 'false' ? 'Non' : null
                    : raw || null
                return <Field key={field.id} label={field.fieldLabel} value={display} />
              })}
            </dl>
          </div>
        )}

        {/* Notes */}
        {banquet.notes && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
            <div className="border-b border-neutral-800 px-6 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Notes</h2>
            </div>
            <p className="p-6 text-sm leading-relaxed text-neutral-300">{banquet.notes}</p>
          </div>
        )}

        {/* Menu items */}
        {banquet.menuItems.length > 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Menu</h2>
              <span className="text-xs text-neutral-500">{banquet.menuItems.length} plats</span>
            </div>
            <div className="divide-y divide-neutral-800">
              <div className="grid grid-cols-[1fr_60px_1fr] px-6 py-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <span>Plat</span>
                <span className="text-right">Qté</span>
                <span className="pl-6">Notes</span>
              </div>
              {banquet.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_60px_1fr] items-center px-6 py-3.5"
                >
                  <span className="text-sm font-medium text-neutral-200">{item.dishName}</span>
                  <span className="text-sm tabular-nums text-neutral-400 text-right">{item.quantity}</span>
                  <span className="pl-6 text-sm text-neutral-500">{item.notes ?? '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
