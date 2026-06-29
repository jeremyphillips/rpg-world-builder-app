import type { CodeRef, Ticket } from '@rpg/contracts/dev-bench'
import { ticketSchema } from '@rpg/contracts/dev-bench'

import type { DevBenchTicketSchemaType } from './ticket.model'

type TicketRecord = DevBenchTicketSchemaType & {
  _id: unknown
  createdAt: Date
  updatedAt: Date
}

export function toTicket(doc: TicketRecord): Ticket {
  return ticketSchema.parse({
    id: String(doc._id),
    key: doc.key,
    title: doc.title,
    description: doc.description ?? undefined,
    type: doc.type,
    status: doc.status,
    priority: doc.priority,
    size: doc.size,
    area: doc.area ?? undefined,
    epicId: doc.epicId ?? null,
    blockedByTicketIds: doc.blockedByTicketIds ?? [],
    relatedTicketIds: doc.relatedTicketIds ?? [],
    acceptanceCriteria: doc.acceptanceCriteria ?? [],
    codeRefs: (doc.codeRefs ?? []) as CodeRef[],
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  })
}
