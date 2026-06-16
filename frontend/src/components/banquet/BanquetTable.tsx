import { useNavigate } from 'react-router-dom'
import { Table } from '../ui/Table'
import { BanquetStatusBadge } from './BanquetStatusBadge'
import type { BanquetSummary } from '../../types/banquet'

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(time: string | null): string {
  if (!time) return '—'
  return time.slice(0, 5)
}

interface Props {
  banquets: BanquetSummary[]
}

export function BanquetTable({ banquets }: Props) {
  const navigate = useNavigate()

  return (
    <Table
      keyExtractor={(b) => b.id}
      rows={banquets}
      onRowClick={(b) => navigate(`/banquets/${b.id}`)}
      emptyMessage="Aucun banquet pour le moment."
      columns={[
        {
          key: 'date',
          header: 'Date',
          render: (b) => (
            <span className="font-medium text-stone-800">{formatDate(b.date)}</span>
          ),
        },
        {
          key: 'time',
          header: 'Horaire',
          render: (b) =>
            b.startTime
              ? `${formatTime(b.startTime)} – ${formatTime(b.endTime)}`
              : '—',
          className: 'text-stone-500',
        },
        {
          key: 'contact',
          header: 'Contact',
          render: (b) => (
            <div>
              <div className="font-medium text-stone-800">{b.contactName ?? '—'}</div>
              {b.contactOrganization && (
                <div className="text-xs text-stone-400 mt-0.5">{b.contactOrganization}</div>
              )}
            </div>
          ),
        },
        {
          key: 'headcount',
          header: 'Invités',
          render: (b) => (
            <span className="tabular-nums">
              {b.headcount != null ? b.headcount : '—'}
            </span>
          ),
          className: 'text-right',
        },
        {
          key: 'status',
          header: 'Statut',
          render: (b) => <BanquetStatusBadge status={b.status} />,
        },
        {
          key: 'source',
          header: 'Source',
          render: (b) => (
            <span className="text-[11px] font-medium uppercase tracking-wide text-stone-400">
              {b.source}
            </span>
          ),
        },
      ]}
    />
  )
}
