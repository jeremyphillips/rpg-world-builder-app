import { z } from 'zod'
import { featSchema, getContentTypeTerm } from '@rpg/contracts'
import type { Feat, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import featsRaw from './data/srd-cc-5.2.1/feats.json'

// Validate the shipped catalog against the contract at module load, so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521_FEATS = z.array(featSchema).parse(featsRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_FEATS,
} as const satisfies Record<SystemRulesetId, Feat[]>

export function loadSeedFeats(rulesetId: SystemRulesetId): Feat[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System feat slugs for a ruleset — used by the homebrew slug guard. */
export function seedFeatSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedFeats(rulesetId).map((feat) => feat.slug))
}

export function getFeatBySlug(rulesetId: SystemRulesetId, slug: string): Feat {
  return getBySlug(loadSeedFeats, rulesetId, slug, getContentTypeTerm('feats').label)
}
