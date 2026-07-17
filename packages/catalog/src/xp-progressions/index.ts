import type { SystemRulesetId, XpProgression } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import xpProgressionsRaw from './data/srd-cc-5.2.1/xp-progressions.json'
import { xpProgressionSeedFileSchema } from '../seed-schemas'

const xpProgressionSeedSchema = xpProgressionSeedFileSchema.superRefine((progressions, ctx) => {
  if (progressions[0]?.scope.kind !== 'standard') {
    ctx.addIssue({
      code: 'custom',
      message: 'The SRD XP progression must use the standard scope',
      path: [0, 'scope'],
    })
  }
})

// Validate the shipped catalog against the contract at module load so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521_XP_PROGRESSIONS = xpProgressionSeedSchema.parse(xpProgressionsRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_XP_PROGRESSIONS,
} as const satisfies Record<SystemRulesetId, XpProgression[]>

export function loadSeedXpProgressions(rulesetId: SystemRulesetId): XpProgression[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System XP progression slugs for a ruleset — used by the homebrew slug guard. */
export function seedXpProgressionSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedXpProgressions(rulesetId).map((progression) => progression.slug))
}

export function getXpProgressionBySlug(rulesetId: SystemRulesetId, slug: string): XpProgression {
  return getBySlug(loadSeedXpProgressions, rulesetId, slug, 'XP progression')
}

export function getStandardXpProgression(rulesetId: SystemRulesetId): XpProgression {
  const progression = loadSeedXpProgressions(rulesetId).find(
    (entry) => entry.scope.kind === 'standard',
  )

  if (progression === undefined) {
    throw new Error(`Standard XP progression not found for ruleset "${rulesetId}"`)
  }

  return progression
}
