import type { CharacterClass } from '../../../../content/classes/class'
import { toEquipmentContentId } from '../../../creature/equipment'
import type { CharacterBuildCatalogIndex } from '../../context'
import type { CharacterProficiencies } from '../../../character/proficiencies'
import { isEquipmentProficient } from './is-equipment-proficient'

/**
 * Recommended picker rows: package grants plus weapons and armor in proficient
 * categories. Availability-filtered to catalog rows present in the index.
 */
export function deriveRecommendedEquipment(args: {
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  proficiencies: CharacterProficiencies
}): ReadonlySet<string> {
  const { characterClass, catalogIndex, proficiencies } = args
  const rulesetId = characterClass.rulesetId
  const recommended = new Set<string>()

  const startingEquipment = characterClass.characterCreation?.startingEquipment
  if (startingEquipment) {
    for (const option of startingEquipment.options) {
      for (const item of option.items) {
        if (item.kind !== 'grant') continue
        const equipmentId = toEquipmentContentId(rulesetId, item.equipmentSlug)
        if (catalogIndex.equipment.has(equipmentId)) {
          recommended.add(equipmentId)
        }
      }
    }
  }

  for (const equipment of catalogIndex.equipment.values()) {
    if (equipment.kind !== 'weapon' && equipment.kind !== 'armor') continue
    if (!isEquipmentProficient(equipment, proficiencies)) continue
    recommended.add(equipment.id)
  }

  return recommended
}
