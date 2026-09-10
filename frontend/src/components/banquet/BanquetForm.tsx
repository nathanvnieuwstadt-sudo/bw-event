import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { MenuItemEditor } from './MenuItemEditor'
import { listContacts } from '../../api/contacts'
import { listEventTypes } from '../../api/eventTypes'
import type { BanquetRequest, BanquetStatus, MenuItemRequest } from '../../types/banquet'
import type { Contact } from '../../types/contact'
import type { EventType } from '../../types/eventType'

interface Props {
  restaurantId: string
  initial?: Partial<BanquetRequest>
  onSubmit: (request: BanquetRequest) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const inputCls =
  'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none'

const selectCls =
  'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none appearance-none cursor-pointer'

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-medium text-neutral-400">
      {children}
      {required && <span className="ml-0.5 text-red-400">*</span>}
    </label>
  )
}

function Card({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`rounded-xl border bg-neutral-900 shadow-sm ${accent ? 'border-neutral-700' : 'border-neutral-800'}`}>
      <div className={`border-b px-6 py-4 ${accent ? 'border-neutral-800 bg-neutral-950' : 'border-neutral-800'}`}>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export function BanquetForm({
  restaurantId,
  initial = {},
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
}: Props) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [contactId, setContactId] = useState(initial.contactId ?? '')
  const [status, setStatus] = useState<BanquetStatus>(initial.status ?? 'DRAFT')
  const [eventTypeId, setEventTypeId] = useState(initial.eventTypeId ?? '')
  const [date, setDate] = useState(initial.date ?? '')
  const [startTime, setStartTime] = useState(initial.startTime ?? '')
  const [endTime, setEndTime] = useState(initial.endTime ?? '')
  const [headcount, setHeadcount] = useState(String(initial.headcount ?? ''))
  const [budget, setBudget] = useState(String(initial.budget ?? ''))
  const [roomSetup, setRoomSetup] = useState(initial.roomSetup ?? '')
  const [dietaryRestrictions, setDietaryRestrictions] = useState(initial.dietaryRestrictions ?? '')
  const [avNeeds, setAvNeeds] = useState(initial.avNeeds ?? '')
  const [depositPaid, setDepositPaid] = useState(initial.depositPaid ?? false)
  const [depositAmount, setDepositAmount] = useState(String(initial.depositAmount ?? ''))
  const [notes, setNotes] = useState(initial.notes ?? '')
  const [menuItems, setMenuItems] = useState<MenuItemRequest[]>(
    initial.menuItems?.map((m) => ({ dishName: m.dishName, quantity: m.quantity, notes: m.notes })) ?? []
  )
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initial.fieldValues ?? {})

  useEffect(() => {
    listContacts(restaurantId).then(setContacts).catch(() => setContacts([]))
    listEventTypes(restaurantId).then(setEventTypes).catch(() => setEventTypes([]))
  }, [restaurantId])

  const selectedEventType = eventTypes.find((et) => et.id === eventTypeId) ?? null

  function setFieldValue(fieldId: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        contactId: contactId || undefined,
        status,
        date: date || undefined,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        headcount: headcount ? parseInt(headcount, 10) : undefined,
        budget: budget ? parseFloat(budget) : undefined,
        roomSetup: roomSetup || undefined,
        dietaryRestrictions: dietaryRestrictions || undefined,
        avNeeds: avNeeds || undefined,
        depositPaid,
        depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
        notes: notes || undefined,
        menuItems: menuItems.filter((m) => m.dishName.trim() !== ''),
        eventTypeId: eventTypeId || undefined,
        fieldValues: Object.keys(fieldValues).length > 0 ? fieldValues : undefined,
      })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Échec de la sauvegarde. Veuillez réessayer.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Event type */}
      <Card title="Type d'événement">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type d'événement</Label>
            <select
              value={eventTypeId}
              onChange={(e) => {
                setEventTypeId(e.target.value)
                setFieldValues({})
              }}
              className={selectCls}
            >
              <option value="">— Non spécifié —</option>
              {eventTypes.map((et) => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </select>
            {eventTypes.length === 0 && (
              <p className="mt-1.5 text-xs text-neutral-500">
                Aucun type défini. Un gestionnaire peut en créer sous Types d'événements.
              </p>
            )}
          </div>
          <div>
            <Label>Statut</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value as BanquetStatus)} className={selectCls}>
              <option value="DRAFT">Brouillon</option>
              <option value="CONFIRMED">Confirmé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>
        </div>

        {selectedEventType && selectedEventType.fields.length > 0 && (
          <div className="mt-5 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">
              {selectedEventType.name} — informations requises
            </p>
            <div className="grid grid-cols-2 gap-4">
              {selectedEventType.fields.map((field) => (
                <div key={field.id}>
                  {field.fieldType === 'BOOLEAN' ? (
                    <label className="flex min-h-[44px] w-fit cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={fieldValues[field.id] === 'true'}
                        onChange={(e) => setFieldValue(field.id, e.target.checked ? 'true' : 'false')}
                        className="h-5 w-5 rounded border-neutral-700 cursor-pointer"
                      />
                      <span className="text-sm text-neutral-300">
                        {field.fieldLabel}
                        {field.required && <span className="ml-0.5 text-red-400">*</span>}
                      </span>
                    </label>
                  ) : field.fieldType === 'SELECT' ? (
                    <>
                      <Label required={field.required}>{field.fieldLabel}</Label>
                      <select
                        value={fieldValues[field.id] ?? ''}
                        onChange={(e) => setFieldValue(field.id, e.target.value)}
                        className={selectCls}
                        required={field.required}
                      >
                        <option value="">Choisir…</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <Label required={field.required}>{field.fieldLabel}</Label>
                      <input
                        type={field.fieldType === 'NUMBER' ? 'number' : 'text'}
                        value={fieldValues[field.id] ?? ''}
                        onChange={(e) => setFieldValue(field.id, e.target.value)}
                        className={inputCls}
                        required={field.required}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Event details */}
      <Card title="Détails de l'événement">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Label>Contact</Label>
            <select value={contactId} onChange={(e) => setContactId(e.target.value)} className={selectCls}>
              <option value="">Sélectionner un contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}{c.organization ? ` — ${c.organization}` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Invités</Label>
            <input
              type="number"
              min={1}
              placeholder="0"
              value={headcount}
              onChange={(e) => setHeadcount(e.target.value)}
              className={`${inputCls} tabular-nums`}
            />
          </div>
          <div>
            <Label>Date</Label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label>Heure de début</Label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputCls} />
          </div>
          <div>
            <Label>Heure de fin</Label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputCls} />
          </div>
        </div>
      </Card>

      {/* Logistics */}
      <Card title="Logistique">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Budget (€)</Label>
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={`${inputCls} tabular-nums`}
            />
          </div>
          <div>
            <Label>Configuration de la salle</Label>
            <input
              type="text"
              placeholder="ex. Tables rondes"
              value={roomSetup}
              onChange={(e) => setRoomSetup(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <Label>Restrictions alimentaires</Label>
            <textarea
              rows={2}
              placeholder="Régimes alimentaires ou allergies"
              value={dietaryRestrictions}
              onChange={(e) => setDietaryRestrictions(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <Label>Besoins audiovisuels</Label>
            <textarea
              rows={2}
              placeholder="Microphone, écran, projecteur…"
              value={avNeeds}
              onChange={(e) => setAvNeeds(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </Card>

      {/* Deposit */}
      <Card title="Acompte">
        <div className="flex items-center gap-6">
          <label className="flex min-h-[44px] w-fit cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={depositPaid}
              onChange={(e) => setDepositPaid(e.target.checked)}
              className="h-5 w-5 rounded border-neutral-700 cursor-pointer"
            />
            <span className="text-sm text-neutral-300">Acompte reçu</span>
          </label>
          <div className="w-40">
            <input
              type="number"
              min={0}
              step="0.01"
              placeholder="Montant (€)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className={`${inputCls} tabular-nums`}
            />
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card title="Notes">
        <textarea
          rows={3}
          placeholder="Notes internes visibles par tout le personnel"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputCls}
        />
      </Card>

      {/* Menu */}
      <Card title="Menu">
        <MenuItemEditor items={menuItems} onChange={setMenuItems} />
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
