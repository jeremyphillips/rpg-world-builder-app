import { parseArgs } from 'node:util'

import { updateTicketInputSchema } from '@rpg/contracts/dev-bench'

import { updateTicket } from '../lib/api'
import { parseJsonObject, requireJsonFlag, type GlobalFlags } from '../lib/args'
import { CliError } from '../lib/errors'
import { writeSuccess } from '../lib/output'
import { resolveTicketRef } from '../lib/ticket-ref'

const OPTIONS = {
  json: { type: 'string' as const },
}

export async function runUpdateTicket(argv: string[], flags: GlobalFlags): Promise<void> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: OPTIONS,
    allowPositionals: true,
    strict: false,
  })

  const ref = positionals[0]
  if (!ref) {
    throw new Error('Missing ticket reference (BENCH-### or Mongo id)')
  }

  const raw = parseJsonObject(requireJsonFlag(values, 'update-ticket'))
  const parsed = updateTicketInputSchema.safeParse(raw)

  if (!parsed.success) {
    throw new CliError('VALIDATION_ERROR', 'Invalid ticket update payload', parsed.error.issues)
  }

  const existing = await resolveTicketRef(ref)
  const ticket = await updateTicket(existing.id, parsed.data)
  writeSuccess(flags.format, { ticket })
}
