import { z } from 'zod'
import { equipmentSchema } from '@rpg/contracts'
import type { Equipment, SystemRulesetId } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import equipmentRaw from './data/srd-cc-5.2.1/equipment.json'

// Validate the shipped catalog against the contract at module load, so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521 = z.array(equipmentSchema).parse(equipmentRaw)

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521,
} as const satisfies Record<SystemRulesetId, Equipment[]>

export function loadSeedEquipment(rulesetId: SystemRulesetId): Equipment[] {
  return SEED_BY_RULESET[rulesetId]
}

/** System equipment slugs for a ruleset — used by the homebrew slug guard. */
export function seedEquipmentSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedEquipment(rulesetId).map((e) => e.slug))
}

export function getEquipmentBySlug(rulesetId: SystemRulesetId, slug: string): Equipment {
  return getBySlug(loadSeedEquipment, rulesetId, slug, 'Equipment')
}
