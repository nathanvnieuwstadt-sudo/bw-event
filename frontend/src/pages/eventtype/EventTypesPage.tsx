import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { listEventTypes, createEventType, updateEventType, deleteEventType } from '../../api/eventTypes'
import { Button } from '../../components/ui/Button'
import type { EventType, EventTypeRequest, EventTypeFieldRequest, FieldType } from '../../types/eventType'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT',    label: 'Texte' },
  { value: 'NUMBER',  label: 'Nombre' },
  { value: 'BOOLEAN', label: 'Oui / Non' },
  { value: 'SELECT',  label: 'Liste déroulante' },
]

const inputCls =
  'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors'
const selectCls =
  'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors appearance-none cursor-pointer'

function emptyField(order: number): EventTypeFieldRequest {
  return { fieldLabel: '', fieldType: 'TEXT', options: '', required: false, displayOrder: order }
}

interface FormState {
  name: string
  description: string
  fields: EventTypeFieldRequest[]
}

function FieldEditor({
  fields,
  onChange,
}: {
  fields: EventTypeFieldRequest[]
  onChange: (fields: EventTypeFieldRequest[]) => void
}) {
  function update(i: number, patch: Partial<EventTypeFieldRequest>) {
    const next = fields.map((f, idx) => (idx === i ? { ...f, ...patch } : f))
    onChange(next)
  }
  function remove(i: number) {
    onChange(fields.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...fields, emptyField(fields.length)])
  }

  return (
    <div className="space-y-2">
      {fields.map((f, i) => (
        <div key={i} className="flex items-start gap-2 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              placeholder="Libellé du champ (ex. Code vestimentaire)"
              value={f.fieldLabel}
              onChange={(e) => update(i, { fieldLabel: e.target.value })}
              className={inputCls}
            />
            <select
              value={f.fieldType}
              onChange={(e) => update(i, { fieldType: e.target.value as FieldType })}
              className={selectCls}
            >
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {f.fieldType === 'SELECT' && (
              <input
                placeholder="Options séparées par des virgules (ex. Intérieur, Extérieur, Terrasse)"
                value={f.options ?? ''}
                onChange={(e) => update(i, { options: e.target.value })}
                className={`${inputCls} col-span-2`}
              />
            )}
          </div>
          <label className="flex items-center gap-1.5 pt-2.5 shrink-0 text-xs text-neutral-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={f.required}
              onChange={(e) => update(i, { required: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-neutral-700 text-neutral-300 cursor-pointer"
            />
            Obligatoire
          </label>
          <button
            type="button"
            onClick={() => remove(i)}
            className="mt-2 shrink-0 text-neutral-500 hover:text-red-500 transition-colors"
            title="Supprimer le champ"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 4v12M4 10h12" />
        </svg>
        Ajouter un champ
      </button>
    </div>
  )
}

function EventTypeForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState
  onSave: (form: FormState) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<FormState>(initial)

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await onSave(form)
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Nom</label>
          <input
            required
            placeholder="ex. Mariage"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-400">Description</label>
          <input
            placeholder="Description courte (facultatif)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-neutral-400">Champs personnalisés</p>
        <FieldEditor
          fields={form.fields}
          onChange={(fields) => setForm({ ...form, fields })}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-neutral-800 pt-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" size="sm" loading={saving}>
          Enregistrer
        </Button>
      </div>
    </form>
  )
}

function EventTypeCard({
  eventType,
  canEdit,
  onEdit,
  onDelete,
}: {
  eventType: EventType
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm">
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-semibold text-neutral-100">{eventType.name}</p>
          {eventType.description && (
            <p className="mt-0.5 text-xs text-neutral-400">{eventType.description}</p>
          )}
          <p className="mt-2 text-xs text-neutral-500">
            {eventType.fields.length === 0
              ? 'Aucun champ personnalisé'
              : `${eventType.fields.length} champ${eventType.fields.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onEdit}
              className="text-xs text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-neutral-500 hover:text-red-500 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {eventType.fields.length > 0 && (
        <div className="border-t border-neutral-800 px-5 pb-4">
          <div className="mt-3 flex flex-wrap gap-2">
            {eventType.fields.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-1 text-xs text-neutral-400"
              >
                {f.fieldLabel}
                {f.required && <span className="text-red-400">*</span>}
                <span className="text-neutral-500">· {FIELD_TYPES.find((t) => t.value === f.fieldType)?.label ?? f.fieldType}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function EventTypesPage() {
  const { restaurantId, hasRole } = useAuth()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [saving, setSaving] = useState(false)

  const canEdit = hasRole('DEV', 'GENERAL_MANAGER')

  useEffect(() => {
    if (!restaurantId) return
    listEventTypes(restaurantId)
      .then(setEventTypes)
      .finally(() => setLoading(false))
  }, [restaurantId])

  function toFormState(et: EventType): FormState {
    return {
      name: et.name,
      description: et.description ?? '',
      fields: et.fields.map((f) => ({
        fieldLabel: f.fieldLabel,
        fieldType: f.fieldType,
        options: f.options.join(', '),
        required: f.required,
        displayOrder: f.displayOrder,
      })),
    }
  }

  function toRequest(form: FormState): EventTypeRequest {
    return {
      name: form.name,
      description: form.description || undefined,
      fields: form.fields
        .filter((f) => f.fieldLabel.trim() !== '')
        .map((f, i) => ({ ...f, displayOrder: i })),
    }
  }

  async function handleSave(form: FormState) {
    if (!restaurantId) return
    setSaving(true)
    try {
      if (editingId === 'new') {
        const created = await createEventType(restaurantId, toRequest(form))
        setEventTypes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      } else if (editingId) {
        const updated = await updateEventType(restaurantId, editingId, toRequest(form))
        setEventTypes((prev) => prev.map((et) => (et.id === editingId ? updated : et)))
      }
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!restaurantId) return
    if (!confirm('Supprimer ce type d\'événement ? Les banquets liés perdront cette association.')) return
    await deleteEventType(restaurantId, id)
    setEventTypes((prev) => prev.filter((et) => et.id !== id))
  }

  return (
    <div className="mx-auto max-w-3xl py-6 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100">Types d'événements</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Définissez les types d'événements que vous organisez et les informations nécessaires pour chacun.
          </p>
        </div>
        {canEdit && editingId === null && (
          <Button size="sm" onClick={() => setEditingId('new')}>
            Nouveau type
          </Button>
        )}
      </div>

      {editingId === 'new' && (
        <div className="mb-6 rounded-xl border border-neutral-700 bg-neutral-900 p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-neutral-100">Nouveau type d'événement</p>
          <EventTypeForm
            initial={{ name: '', description: '', fields: [] }}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-xl bg-neutral-800" />
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-700 p-10 text-center">
          <p className="text-sm text-neutral-400">Aucun type d'événement pour le moment.</p>
          {canEdit && (
            <button
              onClick={() => setEditingId('new')}
              className="mt-2 text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Créer le premier →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {eventTypes.map((et) =>
            editingId === et.id ? (
              <div key={et.id} className="rounded-xl border border-neutral-700 bg-neutral-900 p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-neutral-100">Modifier — {et.name}</p>
                <EventTypeForm
                  initial={toFormState(et)}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <EventTypeCard
                key={et.id}
                eventType={et}
                canEdit={canEdit}
                onEdit={() => setEditingId(et.id)}
                onDelete={() => handleDelete(et.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
