import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { listEventTypes, createEventType, updateEventType, deleteEventType } from '../../api/eventTypes'
import { listMenus, createMenu, updateMenu, deleteMenu } from '../../api/menus'
import { Button } from '../../components/ui/Button'
import type { EventType, EventTypeRequest, EventTypeFieldRequest, FieldType } from '../../types/eventType'
import type { Menu, MenuRequest, MenuDishRequest } from '../../types/menu'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'TEXT',    label: 'Texte' },
  { value: 'NUMBER',  label: 'Nombre' },
  { value: 'BOOLEAN', label: 'Oui / Non' },
  { value: 'SELECT',  label: 'Liste déroulante' },
]

const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500'
const selectCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors appearance-none cursor-pointer dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100'

function emptyField(order: number): EventTypeFieldRequest {
  return { fieldLabel: '', fieldType: 'TEXT', options: '', required: false, displayOrder: order }
}

function emptyDish(order: number): MenuDishRequest {
  return { dishName: '', displayOrder: order }
}

interface EventTypeFormState {
  name: string
  description: string
  fields: EventTypeFieldRequest[]
}

interface MenuFormState {
  name: string
  description: string
  dishes: MenuDishRequest[]
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
        <div key={i} className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950">
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
          <label className="flex items-center gap-2 pt-2 shrink-0 text-xs text-neutral-500 cursor-pointer select-none dark:text-neutral-400">
            <input
              type="checkbox"
              checked={f.required}
              onChange={(e) => update(i, { required: e.target.checked })}
              className="h-5 w-5 rounded border-neutral-300 text-neutral-700 cursor-pointer dark:border-neutral-700 dark:text-neutral-300"
            />
            Obligatoire
          </label>
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-600 active:scale-[0.95] dark:hover:text-red-400"
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
        className="flex min-h-[40px] items-center gap-1.5 rounded-md px-2.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
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
  initial: EventTypeFormState
  onSave: (form: EventTypeFormState) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<EventTypeFormState>(initial)

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
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Nom</label>
          <input
            required
            placeholder="ex. Mariage"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Description</label>
          <input
            placeholder="Description courte (facultatif)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Champs personnalisés</p>
        <FieldEditor
          fields={form.fields}
          onChange={(fields) => setForm({ ...form, fields })}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
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
  // Defensive: falls back to [] if an older backend response doesn't include
  // this field yet (e.g. mid-deploy version skew between frontend/backend).
  const fields = eventType.fields ?? []

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{eventType.name}</p>
          {eventType.description && (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{eventType.description}</p>
          )}
          <p className="mt-2 text-xs text-neutral-500">
            {fields.length === 0
              ? 'Aucun champ personnalisé'
              : `${fields.length} champ${fields.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={onEdit}
              className="min-h-[40px] rounded-md px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="min-h-[40px] rounded-md px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-600 active:scale-[0.97] dark:hover:text-red-400"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {fields.length > 0 && (
        <div className="border-t border-neutral-200 px-5 pb-4 dark:border-neutral-800">
          <div className="mt-3 flex flex-wrap gap-2">
            {fields.map((f) => (
              <span
                key={f.id}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400"
              >
                {f.fieldLabel}
                {f.required && <span className="text-red-700 dark:text-red-400">*</span>}
                <span className="text-neutral-400 dark:text-neutral-500">· {FIELD_TYPES.find((t) => t.value === f.fieldType)?.label ?? f.fieldType}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DishEditor({
  dishes,
  onChange,
}: {
  dishes: MenuDishRequest[]
  onChange: (dishes: MenuDishRequest[]) => void
}) {
  function update(i: number, dishName: string) {
    onChange(dishes.map((d, idx) => (idx === i ? { ...d, dishName } : d)))
  }
  function remove(i: number) {
    onChange(dishes.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...dishes, emptyDish(dishes.length)])
  }

  return (
    <div className="space-y-1.5">
      {dishes.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1 w-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-700" />
          <input
            placeholder="Plat (ex. Velouté de potiron)"
            value={d.dishName}
            onChange={(e) => update(i, e.target.value)}
            className={`${inputCls} py-1.5`}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-red-500/10 hover:text-red-600 active:scale-[0.95] dark:hover:text-red-400"
            title="Supprimer le plat"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex min-h-[32px] items-center gap-1.5 rounded-md px-2 text-xs text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
      >
        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 4v12M4 10h12" />
        </svg>
        Ajouter un plat
      </button>
    </div>
  )
}

function MenuForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: MenuFormState
  onSave: (form: MenuFormState) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<MenuFormState>(initial)

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
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Nom du menu</label>
          <input
            required
            placeholder="ex. Menu Découverte"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-500 dark:text-neutral-400">Description</label>
          <input
            placeholder="Description courte (facultatif)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">Plats</p>
        <DishEditor
          dishes={form.dishes}
          onChange={(dishes) => setForm({ ...form, dishes })}
        />
      </div>

      <div className="flex justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
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

function MenuCard({
  menu,
  canEdit,
  onEdit,
  onDelete,
}: {
  menu: Menu
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const dishes = menu.dishes ?? []

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{menu.name}</p>
          {menu.description && (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{menu.description}</p>
          )}
          <p className="mt-2 text-xs text-neutral-500">
            {dishes.length === 0
              ? 'Aucun plat'
              : `${dishes.length} plat${dishes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canEdit && (
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={onEdit}
              className="min-h-[40px] rounded-md px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="min-h-[40px] rounded-md px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-600 active:scale-[0.97] dark:hover:text-red-400"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>

      {dishes.length > 0 && (
        <div className="border-t border-neutral-200 px-5 pb-4 pt-3 dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {dishes.map((d) => d.dishName).join(' · ')}
          </p>
        </div>
      )}
    </div>
  )
}

export function EventTypesPage() {
  const { restaurantId, hasRole } = useAuth()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [editingTypeId, setEditingTypeId] = useState<string | 'new' | null>(null)
  const [savingType, setSavingType] = useState(false)

  const [menus, setMenus] = useState<Menu[]>([])
  const [loadingMenus, setLoadingMenus] = useState(true)
  const [editingMenuId, setEditingMenuId] = useState<string | 'new' | null>(null)
  const [savingMenu, setSavingMenu] = useState(false)

  const canEdit = hasRole('DEV', 'GENERAL_MANAGER')

  useEffect(() => {
    if (!restaurantId) return
    listEventTypes(restaurantId)
      .then(setEventTypes)
      .finally(() => setLoadingTypes(false))
    listMenus(restaurantId)
      .then(setMenus)
      .finally(() => setLoadingMenus(false))
  }, [restaurantId])

  function toEventTypeFormState(et: EventType): EventTypeFormState {
    return {
      name: et.name,
      description: et.description ?? '',
      fields: (et.fields ?? []).map((f) => ({
        fieldLabel: f.fieldLabel,
        fieldType: f.fieldType,
        options: f.options.join(', '),
        required: f.required,
        displayOrder: f.displayOrder,
      })),
    }
  }

  function toEventTypeRequest(form: EventTypeFormState): EventTypeRequest {
    return {
      name: form.name,
      description: form.description || undefined,
      fields: form.fields
        .filter((f) => f.fieldLabel.trim() !== '')
        .map((f, i) => ({ ...f, displayOrder: i })),
    }
  }

  async function handleSaveType(form: EventTypeFormState) {
    if (!restaurantId) return
    setSavingType(true)
    try {
      if (editingTypeId === 'new') {
        const created = await createEventType(restaurantId, toEventTypeRequest(form))
        setEventTypes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      } else if (editingTypeId) {
        const updated = await updateEventType(restaurantId, editingTypeId, toEventTypeRequest(form))
        setEventTypes((prev) => prev.map((et) => (et.id === editingTypeId ? updated : et)))
      }
      setEditingTypeId(null)
    } finally {
      setSavingType(false)
    }
  }

  async function handleDeleteType(id: string) {
    if (!restaurantId) return
    if (!confirm('Supprimer ce type d\'événement ? Les banquets liés perdront cette association.')) return
    await deleteEventType(restaurantId, id)
    setEventTypes((prev) => prev.filter((et) => et.id !== id))
  }

  function toMenuFormState(m: Menu): MenuFormState {
    return {
      name: m.name,
      description: m.description ?? '',
      dishes: (m.dishes ?? []).map((d) => ({ dishName: d.dishName, displayOrder: d.displayOrder })),
    }
  }

  function toMenuRequest(form: MenuFormState): MenuRequest {
    return {
      name: form.name,
      description: form.description || undefined,
      dishes: form.dishes
        .filter((d) => d.dishName.trim() !== '')
        .map((d, i) => ({ ...d, displayOrder: i })),
    }
  }

  async function handleSaveMenu(form: MenuFormState) {
    if (!restaurantId) return
    setSavingMenu(true)
    try {
      if (editingMenuId === 'new') {
        const created = await createMenu(restaurantId, toMenuRequest(form))
        setMenus((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
      } else if (editingMenuId) {
        const updated = await updateMenu(restaurantId, editingMenuId, toMenuRequest(form))
        setMenus((prev) => prev.map((m) => (m.id === editingMenuId ? updated : m)))
      }
      setEditingMenuId(null)
    } finally {
      setSavingMenu(false)
    }
  }

  async function handleDeleteMenu(id: string) {
    if (!restaurantId) return
    if (!confirm('Supprimer ce menu ?')) return
    await deleteMenu(restaurantId, id)
    setMenus((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="mx-auto max-w-3xl py-6 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Types d'événements &amp; menus</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Gérez les types d'événements que vous organisez et les menus que vous proposez.
        </p>
      </div>

      {/* Event types */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Types d'événements</h2>
          {canEdit && editingTypeId === null && (
            <Button size="sm" onClick={() => setEditingTypeId('new')}>
              Nouveau type
            </Button>
          )}
        </div>

        {editingTypeId === 'new' && (
          <div className="mb-6 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Nouveau type d'événement</p>
            <EventTypeForm
              initial={{ name: '', description: '', fields: [] }}
              onSave={handleSaveType}
              onCancel={() => setEditingTypeId(null)}
              saving={savingType}
            />
          </div>
        )}

        {loadingTypes ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : eventTypes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Aucun type d'événement pour le moment.</p>
            {canEdit && (
              <button
                onClick={() => setEditingTypeId('new')}
                className="mt-2 min-h-[40px] rounded-md px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                Créer le premier →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {eventTypes.map((et) =>
              editingTypeId === et.id ? (
                <div key={et.id} className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Modifier — {et.name}</p>
                  <EventTypeForm
                    initial={toEventTypeFormState(et)}
                    onSave={handleSaveType}
                    onCancel={() => setEditingTypeId(null)}
                    saving={savingType}
                  />
                </div>
              ) : (
                <EventTypeCard
                  key={et.id}
                  eventType={et}
                  canEdit={canEdit}
                  onEdit={() => setEditingTypeId(et.id)}
                  onDelete={() => handleDeleteType(et.id)}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* Menus */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Menus</h2>
          {canEdit && editingMenuId === null && (
            <Button size="sm" onClick={() => setEditingMenuId('new')}>
              Nouveau menu
            </Button>
          )}
        </div>

        {editingMenuId === 'new' && (
          <div className="mb-6 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Nouveau menu</p>
            <MenuForm
              initial={{ name: '', description: '', dishes: [] }}
              onSave={handleSaveMenu}
              onCancel={() => setEditingMenuId(null)}
              saving={savingMenu}
            />
          </div>
        )}

        {loadingMenus ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-28 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        ) : menus.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center dark:border-neutral-700">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Aucun menu pour le moment.</p>
            {canEdit && (
              <button
                onClick={() => setEditingMenuId('new')}
                className="mt-2 min-h-[40px] rounded-md px-3 py-2 text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.97] dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
              >
                Créer le premier →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {menus.map((m) =>
              editingMenuId === m.id ? (
                <div key={m.id} className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
                  <p className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Modifier — {m.name}</p>
                  <MenuForm
                    initial={toMenuFormState(m)}
                    onSave={handleSaveMenu}
                    onCancel={() => setEditingMenuId(null)}
                    saving={savingMenu}
                  />
                </div>
              ) : (
                <MenuCard
                  key={m.id}
                  menu={m}
                  canEdit={canEdit}
                  onEdit={() => setEditingMenuId(m.id)}
                  onDelete={() => handleDeleteMenu(m.id)}
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  )
}
