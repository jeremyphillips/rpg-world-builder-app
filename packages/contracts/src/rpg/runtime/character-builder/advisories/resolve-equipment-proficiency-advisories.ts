import type { CharacterBuildAdvisoryOfCode } from '../../../character-builder/build-advisory'
import { equipmentAdvisoryClass } from '../messages/character-builder-advisory-messages'
import { isEquipmentProficient } from '../resolvers/equipment/is-equipment-proficient'
import type { CharacterBuildAdvisoryFacts } from './character-build-advisory-facts'
import { projectEquipmentAdvisorySubjectIds } from './project-equipment-advisory-subjects'

type EquipmentNotProficientAdvisory = CharacterBuildAdvisoryOfCode<'equipment_not_proficient'>

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
