import { getClassBySlug, getSubclassBySlug, loadSubclassesByClassId } from '@rpg/catalog/classes'
import { getEquipmentBySlug, loadSeedEquipmentByKind } from '@rpg/catalog/equipment'
import type {
  ArmorEquipment,
  EquipmentKind,
  ResolvedSubclass,
  WeaponEquipment,
} from '@rpg/contracts'
import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  isArmorEquipment,
  isWeaponEquipment,
} from '@rpg/contracts'
import { getFeatBySlug } from '@rpg/catalog/feats'
import { getSkillProficiencyBySlug } from '@rpg/catalog/skill-proficiencies'
import { getSpeciesBySlug } from '@rpg/catalog/species'
import { getSpellBySlug } from '@rpg/catalog/spells'

import { STORY_RULESET_ID } from './constants'

export function pickSpecies(slug: string) {
  return getSpeciesBySlug(STORY_RULESET_ID, slug)
}

export function pickEquipment(slug: string) {
  return getEquipmentBySlug(STORY_RULESET_ID, slug)
}

export function pickEquipmentByKind(kind: EquipmentKind, slug: string) {
  const match = loadSeedEquipmentByKind(STORY_RULESET_ID, kind).find((item) => item.slug === slug)
  if (!match) {
    throw new Error(`No ${kind} equipment with slug "${slug}" in ruleset ${STORY_RULESET_ID}`)
  }
  return match
}

export function pickWeapon(slug: string): WeaponEquipment {
  const equipment = pickEquipment(slug)
  if (!isWeaponEquipment(equipment)) {
    throw new Error(`Equipment "${slug}" is not a weapon (kind: ${equipment.kind})`)
  }
  return equipment
}

export function pickArmor(slug: string): ArmorEquipment {
  const equipment = pickEquipment(slug)
  if (!isArmorEquipment(equipment)) {
    throw new Error(`Equipment "${slug}" is not armor (kind: ${equipment.kind})`)
  }
  return equipment
}

export function pickSkillProficiency(slug: string) {
  return getSkillProficiencyBySlug(STORY_RULESET_ID, slug)
}

export function pickClass(slug: string) {
  return getClassBySlug(STORY_RULESET_ID, slug)
}

export function pickSubclass(slug: string) {
  return getSubclassBySlug(STORY_RULESET_ID, slug)
}

export function pickSubclassesForClass(classSlug: string): ResolvedSubclass[] {
  const classId = `${STORY_RULESET_ID}:${classSlug}`
  return loadSubclassesByClassId(STORY_RULESET_ID, classId).map((subclass) => ({
    ...subclass,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }))
}

export function pickSpell(slug: string) {
  return getSpellBySlug(STORY_RULESET_ID, slug)
}

export function pickFeat(slug: string) {
  return getFeatBySlug(STORY_RULESET_ID, slug)
}
