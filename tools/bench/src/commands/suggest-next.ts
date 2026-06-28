import { parseArgs } from 'node:util'

import type { RecommendContext } from '@rpg/dev-bench-core'
import { suggestNextTicket } from '@rpg/dev-bench-core'
import type { TicketArea } from '@rpg/contracts/dev-bench'

import { listEpics, listTickets } from '../lib/api'
import type { GlobalFlags } from '../lib/args'
import { CliError } from '../lib/errors'
import { resolveEpicReference } from '../lib/epic-resolver'
import { writeSuccess } from '../lib/output'

const OPTIONS = {
  'epic-id': { type: 'string' as const },
  'epic-name': { type: 'string' as const },
  area: { type: 'string' as const },
}

export function buildRecommendContext(values: Record<string, unknown>): RecommendContext {
  const context: RecommendContext = {}

  if (typeof values['epic-id'] === 'string' && values['epic-id'].length > 0) {
    context.epicId = values['epic-id']
  }

  if (typeof values.area === 'string' && values.area.length > 0) {
    context.area = values.area as TicketArea
  }

  return context
}

export async function runSuggestNext(argv: string[], flags: GlobalFlags): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: OPTIONS,
    allowPositionals: true,
    strict: false,
  })

  const epicId =
    typeof values['epic-id'] === 'string' && values['epic-id'].length > 0
      ? values['epic-id']
      : undefined
  const epicName =
    typeof values['epic-name'] === 'string' && values['epic-name'].length > 0
      ? values['epic-name']
      : undefined

  const [tickets, epics] = await Promise.all([listTickets(), listEpics()])

  const context = buildRecommendContext(values)

  if (epicId) {
    context.epicId = epicId
  } else if (epicName) {
    const resolution = resolveEpicReference({ epicName }, epics)
    if (!resolution.epicId) {
      throw new CliError('NOT_FOUND', `No epic matched epicName "${epicName}".`)
    }
    context.epicId = resolution.epicId
  }

  const ticket = suggestNextTicket(tickets, epics, context)

  writeSuccess(flags.format, { ticket, context })
}
