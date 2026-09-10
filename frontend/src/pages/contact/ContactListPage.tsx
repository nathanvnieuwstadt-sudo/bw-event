import { useEffect, useState } from 'react'
import { listContacts, deleteContact } from '../../api/contacts'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import type { Contact, ContactRequest } from '../../types/contact'
import { createContact, updateContact } from '../../api/contacts'

function ContactForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Contact
  onSave: (r: ContactRequest) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [organization, setOrganization] = useState(initial?.organization ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSave({ name, email, phone: phone || undefined, organization: organization || undefined })
    } catch {
      setError('Impossible d\'enregistrer le contact.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nom *</label>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">E-mail *</label>
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Téléphone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">Organisation</label>
        <input value={organization} onChange={(e) => setOrganization(e.target.value)}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 transition-colors duration-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none" />
      </div>
      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>
        <Button type="submit" loading={loading}>{initial ? 'Enregistrer' : 'Créer le contact'}</Button>
      </div>
    </form>
  )
}

export function ContactListPage() {
  const { restaurantId, hasRole } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)

  function load() {
    if (!restaurantId) { setLoading(false); return }
    listContacts(restaurantId)
      .then(setContacts)
      .catch(() => setError('Impossible de charger les contacts.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [restaurantId])

  async function handleSave(req: ContactRequest) {
    if (!restaurantId) return
    if (editing) {
      await updateContact(restaurantId, editing.id, req)
    } else {
      await createContact(restaurantId, req)
    }
    setModalOpen(false)
    setEditing(null)
    load()
  }

  async function handleDelete(contact: Contact) {
    if (!restaurantId) return
    if (!confirm(`Supprimer ${contact.name} ?`)) return
    await deleteContact(restaurantId, contact.id)
    load()
  }

  const canEdit = hasRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-neutral-100">Contacts</h1>
        {canEdit && (
          <Button onClick={() => { setEditing(null); setModalOpen(true) }}>Nouveau contact</Button>
        )}
      </div>

      {error && <div className="mb-4 rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}

      {loading ? (
        <div className="text-sm text-neutral-500">Chargement…</div>
      ) : (
        <Table
          keyExtractor={(c) => c.id}
          rows={contacts}
          emptyMessage="Aucun contact pour le moment."
          columns={[
            { key: 'name', header: 'Nom', render: (c) => <span className="font-medium text-neutral-200">{c.name}</span> },
            { key: 'org', header: 'Organisation', render: (c) => c.organization ?? '—' },
            { key: 'email', header: 'E-mail', render: (c) => c.email },
            { key: 'phone', header: 'Téléphone', render: (c) => c.phone ?? '—' },
            {
              key: 'actions',
              header: '',
              render: (c) => canEdit ? (
                <div className="flex gap-2 justify-end">
                  <button onClick={() => { setEditing(c); setModalOpen(true) }}
                    className="text-xs text-brand-400 hover:underline">Modifier</button>
                  <button onClick={() => handleDelete(c)}
                    className="text-xs text-red-500 hover:underline">Supprimer</button>
                </div>
              ) : null,
              className: 'text-right',
            },
          ]}
        />
      )}

      <Modal
        open={modalOpen}
        title={editing ? 'Modifier le contact' : 'Nouveau contact'}
        onClose={() => { setModalOpen(false); setEditing(null) }}
      >
        <ContactForm
          initial={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
        />
      </Modal>
    </div>
  )
}
