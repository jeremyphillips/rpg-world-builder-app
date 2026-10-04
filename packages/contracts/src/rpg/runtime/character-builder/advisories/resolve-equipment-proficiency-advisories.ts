import type { CharacterBuildAdvisoryOfCode } from '../../../character-builder/build-advisory'
import type { CharacterBuilderDraftEquipmentPurchase } from '../draft/draft'
import { equipmentAdvisoryClass } from '../messages/character-builder-advisory-messages'
import { isEquipmentProficient } from '../resolvers/equipment/is-equipment-proficient'
import type { CharacterBuildAdvisoryFacts } from './character-build-advisory-facts'

type EquipmentNotProficientAdvisory = CharacterBuildAdvisoryOfCode<'equipment_not_proficient'>

/** Picker and manual rows the player added. Package-conversion rows belong to a class package. */
function isExplicitEquipmentPurchase(purchase: CharacterBuilderDraftEquipmentPurchase): boolean {
  switch (purchase.sourceMode) {
    case 'manual':
      return true
    case 'startingGold':
      return purchase.origin === 'picker'
  }
}

/**
 * Resolved weapons and armor, plus explicit purchases that are still on the draft
 * because no starting option has funded them. One id per item.
 */
function projectEquipmentAdvisorySubjectIds(facts: CharacterBuildAdvisoryFacts): string[] {
  const ids: string[] = []
  const seen = new Set<string>()
  const add = (equipmentId: string) => {
    if (seen.has(equipmentId)) return
    seen.add(equipmentId)
    ids.push(equipmentId)
  }

  for (const entry of [...facts.equipment.weapons, ...facts.equipment.armor]) {
    add(entry.equipmentId)
  }
  for (const purchase of facts.effectiveDraft.equipment?.purchases ?? []) {
    if (!isExplicitEquipmentPurchase(purchase)) continue
    add(purchase.equipmentId)
  }
  return ids
}

/** Owned weapons, armor, and shields the assembled proficiencies do not cover. */
export function resolveEquipmentProficiencyAdvisories(
  facts: CharacterBuildAdvisoryFacts,
): EquipmentNotProficientAdvisory[] {
  const advisories: EquipmentNotProficientAdvisory[] = []
  for (const equipmentId of projectEquipmentAdvisorySubjectIds(facts)) {
    const equipment = facts.catalogIndex.equipment.get(equipmentId)
    if (!equipment) continue
    const equipmentClass = equipmentAdvisoryClass(equipment)
    if (!equipmentClass || isEquipmentProficient(equipment, facts.proficiencies)) continue
    advisories.push({
      code: 'equipment_not_proficient',
      subject: {
        kind: 'equipment',
        equipmentId: equipment.id,
        label: equipment.name,
        equipmentClass,
      },
    })
  }
  return advisories
}

export function compareEquipmentProficiencyAdvisories(
  a: EquipmentNotProficientAdvisory,
  b: EquipmentNotProficientAdvisory,
): number {
  return (
    a.subject.label.localeCompare(b.subject.label) ||
    a.subject.equipmentId.localeCompare(b.subject.equipmentId)
  )
}
