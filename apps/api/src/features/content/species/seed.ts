import { z } from 'zod'
import { speciesSchema } from '@rpg/contracts'
import type { Species, SystemRulesetId } from '@rpg/contracts'

import speciesRaw from './data/srd-cc-5.2.1/species.json'

// Validate the shipped catalog against the contract at module load so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521 = z.array(speciesSchema).parse(speciesRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521,
} as const satisfies Record<SystemRulesetId, Species[]>

export function loadSeedSpecies(rulesetId: SystemRulesetId): Species[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System species slugs for a ruleset — used by the homebrew slug guard. */
export function seedSpeciesSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedSpecies(rulesetId).map((s) => s.slug))
}
