import { z } from 'zod'
import { equipmentSchema } from '@rpg/contracts'
import type { Armor, Equipment, SystemRulesetId, Weapon } from '@rpg/contracts'

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

/** @deprecated Use {@link loadSeedEquipment} filtered by `kind === 'weapon'`. */
export function loadSeedWeapons(rulesetId: SystemRulesetId): Weapon[] {
  return loadSeedEquipment(rulesetId).filter((item): item is Weapon => item.kind === 'weapon')
}

/** @deprecated Use {@link loadSeedEquipment} filtered by `kind === 'armor'`. */
export function loadSeedArmor(rulesetId: SystemRulesetId): Armor[] {
  return loadSeedEquipment(rulesetId).filter((item): item is Armor => item.kind === 'armor')
}

/** @deprecated Use {@link seedEquipmentSlugs} — all equipment kinds share one slug namespace. */
export function seedWeaponSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedWeapons(rulesetId).map((item) => item.slug))
}

/** @deprecated Use {@link seedEquipmentSlugs} — all equipment kinds share one slug namespace. */
export function seedArmorSlugs(rulesetId: SystemRulesetId): ReadonlySet<string> {
  return new Set(loadSeedArmor(rulesetId).map((item) => item.slug))
}

/** @deprecated Use {@link getEquipmentBySlug} and narrow on `kind === 'weapon'`. */
export function getWeaponBySlug(rulesetId: SystemRulesetId, slug: string): Weapon {
  const item = getEquipmentBySlug(rulesetId, slug)
  if (item.kind !== 'weapon') {
    throw new Error(`Equipment slug "${slug}" is not a weapon (kind: ${item.kind})`)
  }
  return item
}

/** @deprecated Use {@link getEquipmentBySlug} and narrow on `kind === 'armor'`. */
export function getArmorBySlug(rulesetId: SystemRulesetId, slug: string): Armor {
  const item = getEquipmentBySlug(rulesetId, slug)
  if (item.kind !== 'armor') {
    throw new Error(`Equipment slug "${slug}" is not armor (kind: ${item.kind})`)
  }
  return item
}
