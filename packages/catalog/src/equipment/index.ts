import { z } from 'zod'
import {
  EQUIPMENT_KINDS,
  equipmentSchema,
  getContentTypeTerm,
  type Equipment,
  type EquipmentKind,
  type SystemRulesetId,
} from '@rpg/contracts'

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
  return getBySlug(loadSeedEquipment, rulesetId, slug, getContentTypeTerm('equipment').label)
}
