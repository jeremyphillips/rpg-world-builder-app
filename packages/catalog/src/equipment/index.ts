import { z } from 'zod'
import { EQUIPMENT_KINDS, equipmentSchema } from '@rpg/contracts'
import type { Armor, Equipment, EquipmentKind, SystemRulesetId, Weapon } from '@rpg/contracts'

import { getBySlug } from '../lib/get-by-slug'
import adventuringGearRaw from './data/srd-cc-5.2.1/adventuring_gear.json'
import armorRaw from './data/srd-cc-5.2.1/armor.json'
import magicItemRaw from './data/srd-cc-5.2.1/magic_item.json'
import mountRaw from './data/srd-cc-5.2.1/mount.json'
import serviceRaw from './data/srd-cc-5.2.1/service.json'
import toolRaw from './data/srd-cc-5.2.1/tool.json'
import vehicleRaw from './data/srd-cc-5.2.1/vehicle.json'
import weaponRaw from './data/srd-cc-5.2.1/weapon.json'

const equipmentArraySchema = z.array(equipmentSchema)

// Validate the shipped catalog against the contract at module load, so malformed
// seed data fails fast (and in CI) rather than at request time.
const SRD_521_BY_KIND = {
  weapon: equipmentArraySchema.parse(weaponRaw),
  armor: equipmentArraySchema.parse(armorRaw),
  adventuring_gear: equipmentArraySchema.parse(adventuringGearRaw),
  tool: equipmentArraySchema.parse(toolRaw),
  mount: equipmentArraySchema.parse(mountRaw),
  vehicle: equipmentArraySchema.parse(vehicleRaw),
  service: equipmentArraySchema.parse(serviceRaw),
  magic_item: equipmentArraySchema.parse(magicItemRaw),
} as const satisfies Record<EquipmentKind, Equipment[]>

const SRD_521_EQUIPMENT = [
  ...SRD_521_BY_KIND.weapon,
  ...SRD_521_BY_KIND.armor,
  ...SRD_521_BY_KIND.adventuring_gear,
  ...SRD_521_BY_KIND.tool,
  ...SRD_521_BY_KIND.mount,
  ...SRD_521_BY_KIND.vehicle,
  ...SRD_521_BY_KIND.service,
  ...SRD_521_BY_KIND.magic_item,
]

const SEED_BY_RULESET = {
  'srd-cc-5.2.1': SRD_521_EQUIPMENT,
} as const satisfies Record<SystemRulesetId, Equipment[]>

/** Per-kind seed files for a ruleset (validated at module load). */
export const EQUIPMENT_KIND_FILES = EQUIPMENT_KINDS

export type EquipmentKindFile = (typeof EQUIPMENT_KIND_FILES)[number]

export function loadSeedEquipmentByKind(
  rulesetId: SystemRulesetId,
  kind: EquipmentKindFile,
): Equipment[] {
  if (rulesetId !== 'srd-cc-5.2.1') {
    throw new Error(`No equipment seed for ruleset ${rulesetId}`)
  }
  return [...SRD_521_BY_KIND[kind]]
}

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
