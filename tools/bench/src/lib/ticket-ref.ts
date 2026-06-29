import { parseTicketKey, type Ticket } from '@rpg/contracts/dev-bench'

import { getTicketById, getTicketByKey } from './api'

/** BENCH-### (via parseTicketKey) → by-key lookup; otherwise treat as Mongo id. */
export async function resolveTicketRef(ref: string): Promise<Ticket> {
  if (parseTicketKey(ref) != null) {
    return getTicketByKey(ref)
  }

  return getTicketById(ref)
}

export function isTicketKeyRef(ref: string): boolean {
  return parseTicketKey(ref) != null
}
