import { z } from 'zod'
import { startingWealthSchema } from '@rpg/contracts'
import type { StartingWealth, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import startingWealthRaw from './data/srd-cc-5.2.1/starting-wealth.json'

const startingWealthSeedSchema = z
  .array(startingWealthSchema)
  .length(1, 'Each SRD ruleset must ship exactly one starting wealth table')
  .superRefine((tables, ctx) => {
    if (tables[0]?.scope.kind !== 'standard') {
      ctx.addIssue({
        code: 'custom',
        message: 'The SRD starting wealth table must use the standard scope',
        path: [0, 'scope'],
      })
    }
  })

const SRD_521_STARTING_WEALTH = startingWealthSeedSchema.parse(startingWealthRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_STARTING_WEALTH,
} as const satisfies Record<SystemRulesetId, StartingWealth[]>

export function loadSeedStartingWealth(rulesetId: SystemRulesetId): StartingWealth[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System starting wealth slugs for a ruleset — used by the homebrew slug guard. */
export function seedStartingWealthSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedStartingWealth(rulesetId).map((table) => table.slug))
}

export function getStartingWealthBySlug(rulesetId: SystemRulesetId, slug: string): StartingWealth {
  return getBySlug(loadSeedStartingWealth, rulesetId, slug, 'starting wealth table')
}

export function getStandardStartingWealth(rulesetId: SystemRulesetId): StartingWealth {
  const table = loadSeedStartingWealth(rulesetId).find((entry) => entry.scope.kind === 'standard')

  if (table === undefined) {
    throw new Error(`Standard starting wealth table not found for ruleset "${rulesetId}"`)
  }

  return table
}
