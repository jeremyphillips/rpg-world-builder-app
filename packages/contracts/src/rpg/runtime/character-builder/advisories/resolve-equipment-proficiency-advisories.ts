import type { Equipment } from '../../../content/equipment'
import type {
  CharacterBuildAdvisoryOfCode,
  EquipmentAdvisoryClass,
} from '../../../character-builder/build-advisory'
import { isEquipmentProficient } from '../resolvers/equipment/is-equipment-proficient'
import type { CharacterBuildAdvisoryFacts } from './character-build-advisory-facts'

type EquipmentNotProficientAdvisory = CharacterBuildAdvisoryOfCode<'equipment_not_proficient'>

function equipmentAdvisoryClass(equipment: Equipment): EquipmentAdvisoryClass | undefined {
  if (equipment.kind === 'weapon') return 'weapon'
  if (equipment.kind === 'armor') return equipment.category === 'shields' ? 'shield' : 'armor'
  return undefined
}

/** Owned weapons, armor, and shields the assembled proficiencies do not cover. */
export function resolveEquipmentProficiencyAdvisories(
  facts: CharacterBuildAdvisoryFacts,
): EquipmentNotProficientAdvisory[] {
  const advisories: EquipmentNotProficientAdvisory[] = []
  for (const entry of [...facts.equipment.weapons, ...facts.equipment.armor]) {
    const equipment = facts.catalogIndex.equipment.get(entry.equipmentId)
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
