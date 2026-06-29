import { parseArgs } from 'node:util'

import { createEpicInputSchema } from '@rpg/contracts/dev-bench'

import { createEpic } from '../lib/api'
import { parseJsonObject, requireJsonFlag, type GlobalFlags } from '../lib/args'
import { CliError } from '../lib/errors'
import { writeSuccess } from '../lib/output'

const OPTIONS = {
  json: { type: 'string' as const },
}

export async function runCreateEpic(argv: string[], flags: GlobalFlags): Promise<void> {
  const { values } = parseArgs({
    args: argv,
    options: OPTIONS,
    allowPositionals: true,
    strict: false,
  })

  const raw = parseJsonObject(requireJsonFlag(values, 'create-epic'))
  const parsed = createEpicInputSchema.safeParse(raw)

  if (!parsed.success) {
    throw new CliError('VALIDATION_ERROR', 'Invalid epic payload', parsed.error.issues)
  }

  const epic = await createEpic(parsed.data)
  writeSuccess(flags.format, { epic })
}
