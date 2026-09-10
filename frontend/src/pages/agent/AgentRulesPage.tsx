import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { listInstructions, createInstruction, updateInstruction, deleteInstruction } from '../../api/agent'
import { Button } from '../../components/ui/Button'
import type { AgentInstruction, AgentInstructionRequest } from '../../types/agent'

const inputCls =
  'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors'
const textareaCls =
  'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors resize-none'

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
        <label className="mb-1.5 block text-xs font-medium text-neutral-400">Titre</label>
        <input
          required
          placeholder="ex. Mentionner l'acompte requis"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-400">Instruction</label>
        <textarea
          required
          rows={4}
          placeholder="Décrivez ce que l'IA doit faire ou dire…"
          value={form.instruction}
          onChange={(e) => setForm({ ...form, instruction: e.target.value })}
          className={textareaCls}
        />
      </div>
      <label htmlFor="enabled-check" className="flex min-h-[40px] w-fit cursor-pointer select-none items-center gap-2.5">
        <input
          type="checkbox"
          id="enabled-check"
          checked={form.enabled}
          onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          className="h-5 w-5 rounded border-neutral-700 text-neutral-300 cursor-pointer"
        />
        <span className="text-sm text-neutral-300">Actif</span>
      </label>
      <div className="flex justify-end gap-2 border-t border-neutral-800 pt-3">
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
    <div className={`rounded-xl border bg-neutral-900 shadow-sm transition-opacity ${item.enabled ? 'border-neutral-800' : 'border-neutral-800 opacity-60'}`}>
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-semibold text-neutral-100">{item.title}</p>
            {!item.enabled && (
              <span className="rounded-full border border-neutral-800 bg-neutral-950 px-2 py-0.5 text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
                Désactivé
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-neutral-400 leading-relaxed whitespace-pre-line">{item.instruction}</p>
        </div>
        {canEdit && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <button
              onClick={onToggle}
              disabled={toggling}
              title={item.enabled ? 'Désactiver' : 'Activer'}
              className={`relative inline-flex h-11 w-12 shrink-0 items-center justify-center rounded-md transition-colors duration-100 focus:outline-none ${toggling ? 'opacity-50' : 'hover:bg-neutral-800 active:scale-[0.97]'}`}
            >
              <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${item.enabled ? 'bg-brand-600' : 'bg-neutral-700'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-neutral-100 shadow transition-transform duration-200 ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </span>
            </button>
            <button
              onClick={onEdit}
              className="min-h-[40px] rounded-md px-3 py-2 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100 active:scale-[0.97]"
            >
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="min-h-[40px] rounded-md px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400 active:scale-[0.97]"
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
          <h1 className="text-2xl font-semibold text-neutral-100">Instructions de l'agent</h1>
          <p className="mt-1 text-sm text-neutral-400">
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
        <div className="mb-6 rounded-xl border border-neutral-700 bg-neutral-900 p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold text-neutral-100">Nouvelle instruction</p>
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
            <div key={n} className="h-24 animate-pulse rounded-xl bg-neutral-800" />
          ))}
        </div>
      ) : instructions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-700 p-10 text-center">
          <p className="text-sm text-neutral-400">Aucune instruction pour le moment.</p>
          {canEdit && (
            <button
              onClick={() => setEditingId('new')}
              className="mt-2 min-h-[40px] rounded-md px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100 active:scale-[0.97]"
            >
              Ajouter la première →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {instructions.map((item) =>
            editingId === item.id ? (
              <div key={item.id} className="rounded-xl border border-neutral-700 bg-neutral-900 p-5 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-neutral-100">Modifier — {item.title}</p>
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
