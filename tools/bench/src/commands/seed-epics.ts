import { normalizeEpicTitle, SEED_EPICS } from '@rpg/dev-bench-core'
import type { CreateEpicInput } from '@rpg/contracts/dev-bench'

import { createEpic, listEpics } from '../lib/api'
import type { GlobalFlags } from '../lib/args'
import { writeSuccess } from '../lib/output'

function toCreateEpicInput(seed: (typeof SEED_EPICS)[number]): CreateEpicInput {
  const { normalizedTitle: _normalizedTitle, ...input } = seed
  return input
}

export async function runSeedEpics(_argv: string[], flags: GlobalFlags): Promise<void> {
  const existing = await listEpics()
  const existingNormalized = new Set(existing.map((epic) => normalizeEpicTitle(epic.title)))

  const created: string[] = []
  const skipped: string[] = []

  for (const seed of SEED_EPICS) {
    if (existingNormalized.has(seed.normalizedTitle)) {
      skipped.push(seed.title)
      continue
    }

    await createEpic(toCreateEpicInput(seed))
    created.push(seed.title)
  }

  writeSuccess(flags.format, { created, skipped })
}
