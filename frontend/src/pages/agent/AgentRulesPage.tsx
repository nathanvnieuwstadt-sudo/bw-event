import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { listInstructions, createInstruction, updateInstruction, deleteInstruction } from '../../api/agent'
import { Button } from '../../components/ui/Button'
import type { AgentInstruction, AgentInstructionRequest } from '../../types/agent'

const inputCls =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-colors'
const textareaCls =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-colors resize-none'

interface FormState {
  title: string
  instruction: string
  enabled: boolean
}

function emptyForm(): FormState {
  return { title: '', instruction: '', enabled: true }
}

function InstructionForm({
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
      <div>
        <label className="mb-1.5 block text-xs font-medium text-stone-600">Titre</label>
        <input
          required
          placeholder="ex. Mentionner l'acompte requis"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-stone-600">Instruction</label>
        <textarea
          required
          rows={4}
          placeholder="Décrivez ce que l'IA doit faire ou dire…"
          value={form.instruction}
          onChange={(e) => setForm({ ...form, instruction: e.target.value })}
          className={textareaCls}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled-check"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          className="h-4 w-4 rounded border-stone-300 text-slate-700 cursor-pointer"
        />
        <label htmlFor="enabled-check" className="text-sm text-stone-700 cursor-pointer select-none">
          Actif
        </label>
      </div>
      <div className="flex justify-end gap-2 border-t border-stone-100 pt-3">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Annuler</Button>
        <Button type="submit" size="sm" loading={saving}>Enregistrer</Button>
      </div>
    </form>
  )
}

function InstructionCard({
  item,
  canEdit,
  onEdit,
  onDelete,
  onToggle,
  toggling,
}: {
  item: AgentInstruction
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  toggling: boolean
}) {
  return (
    <div className={`rounded-xl border bg-white shadow-sm transition-opacity ${item.enabled ? 'border-stone-200' : 'border-stone-100 opacity-60'}`}>
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-semibold text-stone-900">{item.title}</p>
            {!item.enabled && (
              <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-medium text-stone-400 uppercase tracking-wide">
                Désactivé
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed whitespace-pre-line">{item.instruction}</p>
        </div>
        {canEdit && (
          <div className="flex flex-shrink-0 items-center gap-3">
            <button
              onClick={onToggle}
              disabled={toggling}
              title={item.enabled ? 'Désactiver' : 'Activer'}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${item.enabled ? 'bg-slate-700' : 'bg-stone-200'} disabled:opacity-50`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${item.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
            <button
              onClick={onEdit}
              className="text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="text-xs text-stone-400 hover:text-red-500 transition-colors"
            >
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AgentRulesPage() {
  const { restaurantId, hasRole } = useAuth()
  const [instructions, setInstructions] = useState<AgentInstruction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const canEdit = hasRole('DEV', 'GENERAL_MANAGER')

  useEffect(() => {
    if (!restaurantId) return
    listInstructions(restaurantId)
      .then(setInstructions)
      .finally(() => setLoading(false))
  }, [restaurantId])

  function toFormState(item: AgentInstruction): FormState {
    return { title: item.title, instruction: item.instruction, enabled: item.enabled }
  }

  function toRequest(form: FormState, displayOrder: number): AgentInstructionRequest {
    return { title: form.title, instruction: form.instruction, enabled: form.enabled, displayOrder }
  }

  async function handleSave(form: FormState) {
    if (!restaurantId) return
    setSaving(true)
    try {
      if (editingId === 'new') {
        const created = await createInstruction(restaurantId, toRequest(form, instructions.length))
        setInstructions((prev) => [...prev, created])
      } else if (editingId) {
        const existing = instructions.find((i) => i.id === editingId)!
        const updated = await updateInstruction(restaurantId, editingId, toRequest(form, existing.displayOrder))
        setInstructions((prev) => prev.map((i) => (i.id === editingId ? updated : i)))
      }
      setEditingId(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(item: AgentInstruction) {
    if (!restaurantId) return
    setTogglingId(item.id)
    try {
      const updated = await updateInstruction(restaurantId, item.id, {
        title: item.title,
        instruction: item.instruction,
        enabled: !item.enabled,
        displayOrder: item.displayOrder,
      })
      setInstructions((prev) => prev.map((i) => (i.id === item.id ? updated : i)))
    } finally {
      setTogglingId(null)
    }
  }

  async function handleDelete(id: string) {
    if (!restaurantId) return
    if (!confirm('Supprimer cette instruction ? L\'IA ne l\'appliquera plus.')) return
    await deleteInstruction(restaurantId, id)
    setInstructions((prev) => prev.filter((i) => i.id !== id))
  }

  const activeCount = instructions.filter((i) => i.enabled).length

  return (
    <div className="mx-auto max-w-3xl py-6 px-4">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Instructions de l'agent</h1>
          <p className="mt-1 text-sm text-stone-500">
            Règles que l'IA suit lors de la rédaction des réponses.{' '}
            {!loading && (
              <span>{activeCount} sur {instructions.length} actives.</span>
            )}
          </p>
        </div>
        {canEdit && editingId === null && (
          <Button size="sm" onClick={() => setEditingId('new')}>
            Ajouter une instruction
          </Button>
        )}
      </div>

      {editingId === 'new' && (
        <div className="mb-6 rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-stone-900">Nouvelle instruction</p>
          <InstructionForm
            initial={emptyForm()}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            saving={saving}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 animate-pulse rounded-xl bg-stone-100" />
          ))}
        </div>
      ) : instructions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center">
          <p className="text-sm text-stone-500">Aucune instruction pour le moment.</p>
          {canEdit && (
            <button
              onClick={() => setEditingId('new')}
              className="mt-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Ajouter la première →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {instructions.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-stone-900">Modifier — {item.title}</p>
                <InstructionForm
                  initial={toFormState(item)}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <InstructionCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                onEdit={() => setEditingId(item.id)}
                onDelete={() => handleDelete(item.id)}
                onToggle={() => handleToggle(item)}
                toggling={togglingId === item.id}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}
