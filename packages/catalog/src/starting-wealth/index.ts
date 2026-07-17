import {
  STANDARD_STARTING_WEALTH_SLUG,
  standardStartingWealthTableId,
  type StartingWealth,
  type StartingWealthRules,
  type SystemRulesetId,
} from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import startingWealthRaw from './data/srd-cc-5.2.1/starting-wealth.json'
import { startingWealthSeedFileSchema } from '../seed-schemas'

const SYSTEM_SEED_TIMESTAMP = '2024-05-21T00:00:00.000Z'

const startingWealthSeedSchema = startingWealthSeedFileSchema.superRefine((tables, ctx) => {
  if (tables[0]?.scope.kind !== 'standard') {
    ctx.addIssue({
      code: 'custom',
      message: 'The SRD starting wealth table must use the standard scope',
      path: [0, 'scope'],
    })
  }
})

const SRD_521_STARTING_WEALTH_RULES = startingWealthSeedSchema.parse(startingWealthRaw)

function toStartingWealthTable(
  rulesetId: SystemRulesetId,
  rules: StartingWealthRules,
): StartingWealth {
  return {
    id: standardStartingWealthTableId(rulesetId),
    slug: STANDARD_STARTING_WEALTH_SLUG,
    rulesetId,
    source: 'system',
    campaignId: null,
    createdAt: SYSTEM_SEED_TIMESTAMP,
    updatedAt: SYSTEM_SEED_TIMESTAMP,
    ...rules,
  }
}

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_STARTING_WEALTH_RULES.map((rules) =>
    toStartingWealthTable('srd-cc-5.2.1', rules),
  ),
} as const satisfies Record<SystemRulesetId, StartingWealth[]>

/** Rules-only SRD seed — use for ruleset-patch resolution without content envelope fields. */
export function loadStartingWealthRulesSeed(rulesetId: SystemRulesetId): StartingWealthRules[] {
  return SEED_BY_RULESET[rulesetId].map(({ name, description, imageKey, scope, tiers }) => ({
    name,
    description,
    imageKey,
    scope,
    tiers,
  }))
}

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

/** Rules body for the standard SRD table — input to `resolveStartingWealthRules`. */
export function getStandardStartingWealthRules(rulesetId: SystemRulesetId): StartingWealthRules {
  const table = getStandardStartingWealth(rulesetId)
  return {
    name: table.name,
    description: table.description,
    imageKey: table.imageKey,
    scope: table.scope,
    tiers: table.tiers,
  }
}
