import { parseArgs } from 'node:util'

import { createTicketInputSchema } from '@rpg/contracts/dev-bench'

import { createTicket, listEpics } from '../lib/api'
import { parseCreatedByFlag, parseJsonObject, requireJsonFlag, type GlobalFlags } from '../lib/args'
import { addTicketCliInputSchema } from '../lib/cli-schemas'
import { CliError } from '../lib/errors'
import { resolveEpicReference } from '../lib/epic-resolver'
import { writeSuccess } from '../lib/output'

const OPTIONS = {
  json: { type: 'string' as const },
  'created-by': { type: 'string' as const },
}

export async function runAddTicket(argv: string[], flags: GlobalFlags): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: OPTIONS,
    allowPositionals: true,
    strict: false,
  })

  const raw = parseJsonObject(requireJsonFlag(values, 'add-ticket'))
  const parsed = addTicketCliInputSchema.safeParse(raw)

  if (!parsed.success) {
    throw new CliError('VALIDATION_ERROR', 'Invalid ticket payload', parsed.error.issues)
  }

  const { epicName, ...rest } = parsed.data
  const createdBy = parseCreatedByFlag(values) ?? rest.createdBy ?? 'agent'

  const epics = await listEpics()
  const { epicId, warnings } = resolveEpicReference({ epicId: rest.epicId, epicName }, epics)

  const input = createTicketInputSchema.parse({
    ...rest,
    epicId: epicId ?? null,
    createdBy,
  })

  const ticket = await createTicket(input)
  writeSuccess(flags.format, {
    ticket,
    ...(warnings.length > 0 ? { warnings } : {}),
  })
}
