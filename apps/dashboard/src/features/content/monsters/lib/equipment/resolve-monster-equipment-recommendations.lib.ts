import {
  isWeaponEquipment,
  toEquipmentContentId,
  type Equipment,
  type SystemRulesetId,
} from '@rpg/contracts'

import type { MonsterEquipmentFormEntry } from '../monster-form-values'

export type MonsterEquipmentRecommendationCandidate = {
  equipmentId: string
  label: string
}

function referenceMatchesEquipment(
  reference: string,
  equipment: Equipment,
  rulesetId: SystemRulesetId,
): boolean {
  return (
    reference === equipment.id ||
    reference === equipment.slug ||
    toEquipmentContentId(rulesetId, reference) === equipment.id
  )
}

function resolveWeaponForReference(
  reference: string,
  catalog: readonly Equipment[],
  rulesetId: SystemRulesetId,
): Extract<Equipment, { kind: 'weapon' }> | undefined {
  for (const row of catalog) {
    if (referenceMatchesEquipment(reference, row, rulesetId) && isWeaponEquipment(row)) {
      return row
    }
  }
  return undefined
}

function entryOwnsWeapon(
  entry: MonsterEquipmentFormEntry,
  weapon: Equipment,
  rulesetId: SystemRulesetId,
): boolean {
  return referenceMatchesEquipment(entry.equipmentId, weapon, rulesetId)
}

/** Missing specific-weapon proficiency rows eligible for equipment quick-add. */
export function resolveMonsterEquipmentWeaponRecommendations(input: {
  /** Active-mode individual weapon grant ids, in selection order. */
  weaponProficiencyItemIds: readonly string[]
  referenceEquipment: readonly Equipment[]
  equipmentEntries: readonly MonsterEquipmentFormEntry[]
  rulesetId: SystemRulesetId
}): MonsterEquipmentRecommendationCandidate[] {
  const { weaponProficiencyItemIds, referenceEquipment, equipmentEntries, rulesetId } = input

  const referenceIds = new Set(referenceEquipment.map((row) => row.id))
  const recommendations: MonsterEquipmentRecommendationCandidate[] = []

  for (const itemRef of weaponProficiencyItemIds) {
    const weapon = resolveWeaponForReference(itemRef, referenceEquipment, rulesetId)
    if (!weapon || !referenceIds.has(weapon.id)) continue

    const owned = equipmentEntries.some((entry) => entryOwnsWeapon(entry, weapon, rulesetId))
    if (owned) continue

    recommendations.push({ equipmentId: weapon.id, label: weapon.name })
  }

  return recommendations
}
