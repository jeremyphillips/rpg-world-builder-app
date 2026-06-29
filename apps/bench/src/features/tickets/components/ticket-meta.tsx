import { Link } from 'react-router-dom'

import type { Ticket } from '@rpg/contracts/dev-bench'
import { getTicketCreatedByLabel } from '@rpg/contracts/dev-bench'
import { Text } from '@rpg/ui'
import { ExternalLink } from 'lucide-react'

import {
  ticketMetaDetailLinkClasses,
  ticketMetaDetailLinkIconClasses,
  ticketMetaKeyClasses,
  ticketMetaKeyRowClasses,
  ticketMetaTitleClasses,
} from './ticket-meta.variants'

type TicketMetaFields = Pick<Ticket, 'key' | 'title' | 'createdAt' | 'updatedAt' | 'createdBy'>

interface TicketMetaKickerProps {
  ticket: Pick<Ticket, 'key'>
  /** When set, shows an icon link to the full ticket page beside the key. */
  detailHref?: string
}

export function TicketMetaKicker({ ticket, detailHref }: TicketMetaKickerProps) {
  return (
    <div className={ticketMetaKeyRowClasses}>
      <Text className={ticketMetaKeyClasses}>{ticket.key}</Text>
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
  )
}

interface TicketMetaTimestampsProps {
  ticket: Pick<Ticket, 'createdAt' | 'updatedAt' | 'createdBy'>
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString()
}

export function TicketMetaTimestamps({ ticket }: TicketMetaTimestampsProps) {
  return (
    <Text variant="muted" className="text-xs">
      Created {formatTimestamp(ticket.createdAt)} by {getTicketCreatedByLabel(ticket.createdBy)}
      {' · '}
      Updated {formatTimestamp(ticket.updatedAt)}
    </Text>
  )
}

interface TicketMetaProps {
  ticket: TicketMetaFields
  /** When set, shows an icon link beside the key to the full ticket page. */
  detailHref?: string
}

/** Full-page ticket meta: key, title, and created/updated line. */
export function TicketMeta({ ticket, detailHref }: TicketMetaProps) {
  return (
    <div className="space-y-1">
      <TicketMetaKicker ticket={ticket} detailHref={detailHref} />
      <Text className={ticketMetaTitleClasses}>{ticket.title}</Text>
      <TicketMetaTimestamps ticket={ticket} />
    </div>
  )
}

export { ticketMetaTitleClasses }
