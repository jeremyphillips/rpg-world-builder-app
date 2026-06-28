import { z } from 'zod'

export const TICKET_KEY_PREFIX = 'BENCH'

export const ticketKeySchema = z.string().regex(/^BENCH-\d{3,}$/)

/**
 * Format a positive integer sequence as BENCH-###.
 * - Rejects non-integers and values < 1.
 * - Pads to 3 digits when sequence < 100 (1 → BENCH-001, 42 → BENCH-042).
 * - Preserves unpadded width for sequence >= 100 (1000 → BENCH-1000).
 */
export function formatTicketKey(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new RangeError(`Ticket key sequence must be a positive integer, got ${sequence}`)
  }

  if (sequence < 100) {
    return `${TICKET_KEY_PREFIX}-${String(sequence).padStart(3, '0')}`
  }

  return `${TICKET_KEY_PREFIX}-${sequence}`
}

/** Parse sequence from a key — for display/query; not for assignment. */
export function parseTicketKey(key: string): number | null {
  const match = /^BENCH-(\d+)$/.exec(key)
  if (!match) {
    return null
  }

  const digits = match[1]
  if (!digits) {
    return null
  }

  const sequence = Number.parseInt(digits, 10)
  return sequence >= 1 ? sequence : null
}
