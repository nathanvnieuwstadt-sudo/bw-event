import { useEffect, useState } from 'react'
import { listStaff, createStaff, deleteStaff } from '../../api/users'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import type { User, CreateStaffRequest, UserRole } from '../../types/user'

const STAFF_ROLES: Exclude<UserRole, 'DEV'>[] = ['OWNER', 'GENERAL_MANAGER', 'FLOOR_MANAGER', 'KITCHEN']

const ROLE_LABELS: Record<string, string> = {
  DEV: 'DEV',
  OWNER: 'Propriétaire',
  GENERAL_MANAGER: 'Directeur général',
  FLOOR_MANAGER: 'Responsable de salle',
  KITCHEN: 'Cuisine',
}

function StaffForm({
  onSave,
  onCancel,
}: {
  onSave: (r: CreateStaffRequest) => Promise<void>
  onCancel: () => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Exclude<UserRole, 'DEV'>>('FLOOR_MANAGER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSave({ email, password, role })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Impossible de créer ce compte. Veuillez réessayer.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">E-mail *</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Mot de passe provisoire *</label>
        <input required type="text" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Au moins 8 caractères"
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
        <p className="mt-1.5 text-xs text-neutral-500">
          Communiquez-le à la personne concernée — il n'existe pas encore de réinitialisation en libre-service.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Rôle *</label>
        <select required value={role} onChange={(e) => setRole(e.target.value as Exclude<UserRole, 'DEV'>)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none appearance-none cursor-pointer">
          {STAFF_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" loading={loading}>Créer le compte</Button>
      </div>
    </form>
  )
}

export function StaffListPage() {
  const { restaurantId, userId } = useAuth()
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function load() {
    if (!restaurantId) { setLoading(false); return }
    listStaff(restaurantId)
      .then(setStaff)
      .catch(() => setError('Impossible de charger le personnel.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [restaurantId])

  async function handleSave(req: CreateStaffRequest) {
    if (!restaurantId) return
    await createStaff(restaurantId, req)
    setModalOpen(false)
    load()
  }

  async function handleDelete(member: User) {
    if (!restaurantId) return
    if (!confirm(`Supprimer le compte ${member.email} ?`)) return
    await deleteStaff(restaurantId, member.id)
    load()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-100">Personnel</h1>
        <Button onClick={() => setModalOpen(true)}>Nouveau compte</Button>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

      {loading ? (
        <div className="text-sm text-neutral-500">Chargement…</div>
      ) : (
        <Table
          keyExtractor={(u) => u.id}
          rows={staff}
          emptyMessage="Aucun compte pour le moment."
          columns={[
            { key: 'email', header: 'E-mail', render: (u) => <span className="font-medium text-neutral-200">{u.email}</span> },
            { key: 'role', header: 'Rôle', render: (u) => ROLE_LABELS[u.role] ?? u.role },
            {
              key: 'actions',
              header: '',
              render: (u) => u.id === userId ? null : (
                <div className="flex justify-end">
                  <button onClick={() => handleDelete(u)}
                    className="min-h-[40px] rounded-md px-3 py-2 text-xs font-medium text-red-400 transition-colors duration-100 hover:bg-red-500/10 active:scale-[0.97]">Supprimer</button>
                </div>
              ),
              className: 'text-right',
            },
          ]}
        />
      )}

      <Modal open={modalOpen} title="Nouveau compte" onClose={() => setModalOpen(false)}>
        <StaffForm onSave={handleSave} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  )
}
