import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { listDrafts, approveDraft, rejectDraft } from '../../api/agent'
import type { AgentDraft, DraftStatus } from '../../types/agent'

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const STATUS_STYLES: Record<DraftStatus, { label: string; cls: string }> = {
  PENDING:  { label: 'En attente', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  APPROVED: { label: 'Approuvé',   cls: 'bg-green-500/10 text-green-400 border-green-500/30' },
  REJECTED: { label: 'Rejeté',     cls: 'bg-red-500/10 text-red-400 border-red-500/30' },
  SENT:     { label: 'Envoyé',     cls: 'bg-neutral-950 text-neutral-400 border-neutral-800' },
}

function StatusBadge({ status }: { status: DraftStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  )
}

interface ThreadGroup {
  threadId: string
  subject: string | null
  senderMessage: string | null
  lastMessageAt: string | null
  contactName: string | null
  drafts: AgentDraft[]
  pendingCount: number
}

function groupByThread(drafts: AgentDraft[]): ThreadGroup[] {
  const map = new Map<string, ThreadGroup>()
  for (const d of drafts) {
    const key = d.emailThreadId
    if (!map.has(key)) {
      map.set(key, {
        threadId: key,
        subject: d.emailSubject,
        senderMessage: d.emailSenderMessage,
        lastMessageAt: d.emailLastMessageAt,
        contactName: d.contactName,
        drafts: [],
        pendingCount: 0,
      })
    }
    const g = map.get(key)!
    g.drafts.push(d)
    if (d.status === 'PENDING') g.pendingCount++
  }
  return Array.from(map.values()).sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return bTime - aTime
  })
}

export function AgentDraftPage() {
  const { restaurantId, hasRole } = useAuth()
  const [drafts, setDrafts] = useState<AgentDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const canReview = hasRole('DEV', 'GENERAL_MANAGER', 'FLOOR_MANAGER')

  useEffect(() => {
    if (!restaurantId) { setLoading(false); return }
    listDrafts(restaurantId)
      .then((d) => {
        setDrafts(d)
        if (d.length > 0) {
          const pending = d.find((x) => x.status === 'PENDING')
          setSelectedThreadId(pending?.emailThreadId ?? d[0].emailThreadId)
        }
      })
      .finally(() => setLoading(false))
  }, [restaurantId])

  const threads = groupByThread(drafts)
  const selectedThread = threads.find((t) => t.threadId === selectedThreadId) ?? null

  async function handleApprove(draftId: string) {
    if (!restaurantId) return
    setBusy(draftId)
    try {
      const updated = await approveDraft(restaurantId, draftId)
      setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    } finally {
      setBusy(null)
    }
  }

  async function handleReject(draftId: string) {
    if (!restaurantId) return
    setBusy(draftId)
    try {
      const updated = await rejectDraft(restaurantId, draftId)
      setDrafts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))
    } finally {
      setBusy(null)
    }
  }

  const pendingTotal = drafts.filter((d) => d.status === 'PENDING').length

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-neutral-100">Boîte de l'agent</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {loading ? 'Chargement…' : pendingTotal > 0
              ? `${pendingTotal} brouillon${pendingTotal !== 1 ? 's' : ''} en attente de relecture`
              : 'Tous les brouillons ont été vérifiés'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-5">
          <div className="w-64 space-y-1.5">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-md bg-neutral-800" />)}
          </div>
          <div className="flex-1 h-64 animate-pulse rounded-lg bg-neutral-800" />
        </div>
      ) : threads.length === 0 ? (
        <div className="flex items-start gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-6 shadow-card">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-neutral-800 bg-neutral-950">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-500">
              <rect x="3" y="8" width="14" height="10" rx="2" />
              <path d="M7 8V6a3 3 0 0 1 6 0v2" />
              <circle cx="7.5" cy="13" r="1" fill="currentColor" stroke="none" />
              <circle cx="12.5" cy="13" r="1" fill="currentColor" stroke="none" />
              <path d="M8.5 16h3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-300">Aucun brouillon</p>
            <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
              Une fois connecté, les e-mails de réservation entrants seront analysés par l'agent IA et les brouillons de réponse apparaîtront ici pour relecture.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-5 items-start">
          {/* Thread list */}
          <div className="w-64 flex-none overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900 shadow-card divide-y divide-neutral-800">
            {threads.map((t) => (
              <button
                key={t.threadId}
                onClick={() => setSelectedThreadId(t.threadId)}
                className={[
                  'w-full px-4 py-3.5 text-left transition-colors duration-75',
                  selectedThreadId === t.threadId
                    ? 'bg-brand-500/10'
                    : 'hover:bg-neutral-950 active:bg-neutral-800',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium leading-snug line-clamp-2 ${selectedThreadId === t.threadId ? 'text-brand-400' : 'text-neutral-200'}`}>
                    {t.subject ?? 'Sans objet'}
                  </p>
                  {t.pendingCount > 0 && (
                    <span className="mt-0.5 flex-shrink-0 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white leading-none">
                      {t.pendingCount}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {t.contactName ?? 'Expéditeur inconnu'} · {formatDate(t.lastMessageAt)}
                </p>
              </button>
            ))}
          </div>

          {/* Thread detail */}
          <div className="flex-1 min-w-0 space-y-4">
            {selectedThread ? (
              <>
                {/* Incoming email */}
                {selectedThread.senderMessage && (
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900 shadow-card">
                    <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-neutral-100">{selectedThread.subject}</p>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {selectedThread.contactName ?? 'Client'} · {formatDateTime(selectedThread.lastMessageAt)}
                        </p>
                      </div>
                      <span className="text-xs text-neutral-500 bg-neutral-800 rounded px-2 py-1">Reçu</span>
                    </div>
                    <div className="px-5 py-4">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-300 leading-relaxed">
                        {selectedThread.senderMessage}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Drafts for this thread */}
                {selectedThread.drafts
                  .slice()
                  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                  .map((draft) => (
                    <div key={draft.id} className="rounded-lg border border-neutral-800 bg-neutral-900 shadow-card">
                      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-neutral-400">Brouillon IA</span>
                          <span className="text-neutral-800">·</span>
                          <span className="text-xs text-neutral-500">{formatDateTime(draft.createdAt)}</span>
                        </div>
                        <StatusBadge status={draft.status} />
                      </div>

                      <div className="px-5 py-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-neutral-300 leading-relaxed">
                          {draft.draftBody}
                        </pre>
                      </div>

                      {draft.status === 'PENDING' && canReview && (
                        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 px-5 py-3">
                          <button
                            onClick={() => handleReject(draft.id)}
                            disabled={busy === draft.id}
                            className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-400 hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            Rejeter
                          </button>
                          <button
                            onClick={() => handleApprove(draft.id)}
                            disabled={busy === draft.id}
                            className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
                          >
                            {busy === draft.id ? 'Enregistrement…' : 'Approuver et envoyer'}
                          </button>
                        </div>
                      )}

                      {(draft.status === 'APPROVED' || draft.status === 'REJECTED') && draft.reviewedAt && (
                        <div className="border-t border-neutral-800 px-5 py-2.5">
                          <p className="text-xs text-neutral-500">
                            {draft.status === 'APPROVED' ? 'Approuvé' : 'Rejeté'} le {formatDateTime(draft.reviewedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-neutral-800 text-sm text-neutral-500">
                Sélectionnez un fil pour voir les brouillons
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
