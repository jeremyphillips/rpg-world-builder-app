import { z } from 'zod'
import { weaponSchema } from '@rpg/contracts'
import type { Weapon, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import weaponsRaw from './data/srd-cc-5.2.1/weapons.json'

// Validate the shipped catalog against the contract at module load so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521 = z.array(weaponSchema).parse(weaponsRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521,
} as const satisfies Record<SystemRulesetId, Weapon[]>

export function loadSeedWeapons(rulesetId: SystemRulesetId): Weapon[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System weapon slugs for a ruleset — used by the homebrew slug guard. */
export function seedWeaponSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedWeapons(rulesetId).map((w) => w.slug))
}

export function getWeaponBySlug(rulesetId: SystemRulesetId, slug: string): Weapon {
  return getBySlug(loadSeedWeapons, rulesetId, slug, 'Weapon')
}
