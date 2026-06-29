import { Link } from 'react-router-dom'

import type { Ticket } from '@rpg/contracts/dev-bench'
import { getTicketCreatedByLabel } from '@rpg/contracts/dev-bench'
import { Text } from '@rpg/ui'
import { ExternalLink } from 'lucide-react'

import {
  ticketMetaDetailLinkClasses,
  ticketMetaDetailLinkIconClasses,
  ticketMetaKeyClasses,
  ticketMetaTitleClasses,
  ticketMetaTitleRowClasses,
} from './ticket-meta.variants'

interface TicketMetaProps {
  ticket: Pick<Ticket, 'key' | 'title' | 'createdAt' | 'updatedAt' | 'createdBy'>
  /** When set, shows an icon link beside the title to the full ticket page. */
  detailHref?: string
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function TicketMeta({ ticket, detailHref }: TicketMetaProps) {
  return (
    <div className="space-y-1">
      <Text className={ticketMetaKeyClasses}>{ticket.key}</Text>
      <div className={ticketMetaTitleRowClasses}>
        <Text className={ticketMetaTitleClasses}>{ticket.title}</Text>
        {detailHref ? (
          <Link
            to={detailHref}
            className={ticketMetaDetailLinkClasses}
            aria-label={`Open ${ticket.key} full page`}
          >
            <ExternalLink className={ticketMetaDetailLinkIconClasses} aria-hidden />
          </Link>
        ) : null}
      </div>
      <Text variant="muted" className="text-xs">
        Created {formatTimestamp(ticket.createdAt)} by {getTicketCreatedByLabel(ticket.createdBy)}
        {' · '}
        Updated {formatTimestamp(ticket.updatedAt)}
      </Text>
    </div>
  )
}
