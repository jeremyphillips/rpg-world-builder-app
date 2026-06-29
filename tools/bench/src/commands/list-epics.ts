import { parseArgs } from 'node:util'

import { buildListEpicsQuery, listEpics } from '../lib/api'
import type { GlobalFlags } from '../lib/args'
import { writeSuccess } from '../lib/output'

const OPTIONS = {
  status: { type: 'string' as const },
  area: { type: 'string' as const },
}

export async function runListEpics(argv: string[], flags: GlobalFlags): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: OPTIONS,
    allowPositionals: true,
    strict: false,
  })

  const epics = await listEpics(buildListEpicsQuery(values))
  writeSuccess(flags.format, { epics })
}
