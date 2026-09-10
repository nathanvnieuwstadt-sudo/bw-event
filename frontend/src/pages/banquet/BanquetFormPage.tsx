import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createBanquet, getBanquet, updateBanquet } from '../../api/banquets'
import { useAuth } from '../../auth/useAuth'
import { BanquetForm } from '../../components/banquet/BanquetForm'
import type { Banquet, BanquetRequest } from '../../types/banquet'

export function BanquetFormPage() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const { restaurantId } = useAuth()
  const navigate = useNavigate()
  const [existing, setExisting] = useState<Banquet | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(isEdit)

  useEffect(() => {
    if (!isEdit || !restaurantId || !id) return
    getBanquet(restaurantId, id)
      .then(setExisting)
      .finally(() => setLoadingExisting(false))
  }, [isEdit, restaurantId, id])

  async function handleSubmit(request: BanquetRequest) {
    if (!restaurantId) return
    if (isEdit && id) {
      await updateBanquet(restaurantId, id, request)
      navigate(`/banquets/${id}`)
    } else {
      const created = await createBanquet(restaurantId, request)
      navigate(`/banquets/${created.id}`)
    }
  }

  if (loadingExisting) {
    return (
      <div className="mx-auto max-w-4xl py-8 px-4 space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-800" />
        <div className="h-96 animate-pulse rounded-xl bg-neutral-800" />
      </div>
    )
  }

  const initial: Partial<BanquetRequest> = existing
    ? {
        contactId: existing.contact?.id,
        status: existing.status,
        source: existing.source,
        date: existing.date ?? undefined,
        startTime: existing.startTime ?? undefined,
        endTime: existing.endTime ?? undefined,
        headcount: existing.headcount ?? undefined,
        budget: existing.budget ?? undefined,
        roomSetup: existing.roomSetup ?? undefined,
        dietaryRestrictions: existing.dietaryRestrictions ?? undefined,
        avNeeds: existing.avNeeds ?? undefined,
        depositPaid: existing.depositPaid,
        depositAmount: existing.depositAmount ?? undefined,
        notes: existing.notes ?? undefined,
        menuItems: existing.menuItems.map((m) => ({
          dishName: m.dishName,
          quantity: m.quantity,
          notes: m.notes ?? undefined,
        })),
        eventTypeId: existing.eventType?.id ?? undefined,
        fieldValues: existing.fieldValues ?? {},
      }
    : {}

  const backTo = isEdit && id ? `/banquets/${id}` : '/banquets'
  const backLabel = isEdit ? 'Retour au banquet' : 'Banquets'

  return (
    <div className="mx-auto max-w-4xl py-6 px-4">
      <div className="mb-8">
        <button
          onClick={() => navigate(backTo)}
          className="-ml-2.5 mb-1 flex min-h-[40px] items-center gap-1.5 rounded-md px-2.5 text-xs text-neutral-500 transition-colors hover:bg-neutral-900 hover:text-neutral-300 active:scale-[0.97]"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4L6 10l6 6" />
          </svg>
          {backLabel}
        </button>
        <h1 className="text-2xl font-semibold text-neutral-100">
          {isEdit ? 'Modifier le banquet' : 'Nouveau banquet'}
        </h1>
        {isEdit && existing?.contact?.name && (
          <p className="mt-1 text-sm text-neutral-400">{existing.contact.name}</p>
        )}
      </div>

      <BanquetForm
        restaurantId={restaurantId!}
        initial={initial}
        onSubmit={handleSubmit}
        onCancel={() => navigate(backTo)}
        submitLabel={isEdit ? 'Enregistrer' : 'Créer le banquet'}
      />
    </div>
  )
}
