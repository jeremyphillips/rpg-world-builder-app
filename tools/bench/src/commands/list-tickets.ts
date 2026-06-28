import { parseArgs } from 'node:util'

import { buildListTicketsQuery, listTickets } from '../lib/api'
import type { GlobalFlags } from '../lib/args'
import { writeSuccess } from '../lib/output'

const OPTIONS = {
  status: { type: 'string' as const },
  'epic-id': { type: 'string' as const },
  area: { type: 'string' as const },
  type: { type: 'string' as const },
  priority: { type: 'string' as const },
  size: { type: 'string' as const },
  'created-by': { type: 'string' as const },
}

export async function runListTickets(argv: string[], flags: GlobalFlags): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: OPTIONS,
    allowPositionals: true,
    strict: false,
  })

  const tickets = await listTickets(buildListTicketsQuery(values))
  writeSuccess(flags.format, { tickets })
}
