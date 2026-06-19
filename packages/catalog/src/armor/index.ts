import { z } from 'zod'
import { armorSchema } from '@rpg/contracts'
import type { Armor, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import armorRaw from './data/srd-cc-5.2.1/armor.json'

// Validate the shipped catalog against the contract at module load so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521 = z.array(armorSchema).parse(armorRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521,
} as const satisfies Record<SystemRulesetId, Armor[]>

export function loadSeedArmor(rulesetId: SystemRulesetId): Armor[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System armor slugs for a ruleset — used by the homebrew slug guard. */
export function seedArmorSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedArmor(rulesetId).map((a) => a.slug))
}

export function getArmorBySlug(rulesetId: SystemRulesetId, slug: string): Armor {
  return getBySlug(loadSeedArmor, rulesetId, slug, 'Armor')
}
