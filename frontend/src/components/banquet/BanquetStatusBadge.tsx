import { Badge } from '../ui/Badge'
import type { BanquetStatus } from '../../types/banquet'

export function BanquetStatusBadge({ status }: { status: BanquetStatus }) {
  switch (status) {
    case 'CONFIRMED': return <Badge color="green">Confirmé</Badge>
    case 'DRAFT':     return <Badge color="amber">Brouillon</Badge>
    case 'CANCELLED': return <Badge color="red">Annulé</Badge>
  }
}
