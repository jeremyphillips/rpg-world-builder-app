import type { GlobalFlags } from '../lib/args'
import { resolveTicketRef } from '../lib/ticket-ref'
import { writeSuccess } from '../lib/output'

export async function runGetTicket(argv: string[], flags: GlobalFlags): Promise<void> {
  const ref = argv[0]

  if (!ref) {
    throw new Error('Missing ticket reference (BENCH-### or Mongo id)')
  }

  const ticket = await resolveTicketRef(ref)
  writeSuccess(flags.format, { ticket })
}
