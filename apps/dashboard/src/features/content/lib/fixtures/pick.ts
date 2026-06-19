import { getArmorBySlug } from '@rpg/catalog/armor'
import { getClassBySlug, getSubclassBySlug, loadSubclassesByClassId } from '@rpg/catalog/classes'
import { getEquipmentBySlug } from '@rpg/catalog/equipment'
import { getSkillProficiencyBySlug } from '@rpg/catalog/skill-proficiencies'
import { getSpeciesBySlug } from '@rpg/catalog/species'
import { getWeaponBySlug } from '@rpg/catalog/weapons'

import { STORY_RULESET_ID } from './constants'

export function pickSpecies(slug: string) {
  return getSpeciesBySlug(STORY_RULESET_ID, slug)
}

export function pickArmor(slug: string) {
  return getArmorBySlug(STORY_RULESET_ID, slug)
}

export function pickWeapon(slug: string) {
  return getWeaponBySlug(STORY_RULESET_ID, slug)
}

export function pickEquipment(slug: string) {
  return getEquipmentBySlug(STORY_RULESET_ID, slug)
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

export function pickSubclassesForClass(classSlug: string) {
  const classId = `${STORY_RULESET_ID}:${classSlug}`
  return loadSubclassesByClassId(STORY_RULESET_ID, classId)
}
