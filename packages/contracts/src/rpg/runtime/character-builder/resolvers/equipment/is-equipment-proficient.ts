import type { Equipment } from '../../../../content/equipment'
import { isToolProficient } from '../../../creature/proficiencies'
import { toEquipmentContentId } from '../../../creature/equipment'
import type { CharacterProficiencies } from '../../../character/proficiencies'

function weaponIdMatchesEquipment(
  weaponId: string,
  equipment: Extract<Equipment, { kind: 'weapon' }>,
): boolean {
  return (
    weaponId === equipment.id ||
    weaponId === equipment.slug ||
    toEquipmentContentId(equipment.rulesetId, weaponId) === equipment.id
  )
}

/** Returns true when the character's assembled proficiencies cover this equipment row. */
export function isEquipmentProficient(
  equipment: Equipment,
  proficiencies: CharacterProficiencies,
): boolean {
  switch (equipment.kind) {
    case 'weapon':
      return proficiencies.weapons.some(
        (entry) =>
          (entry.weaponId !== undefined && weaponIdMatchesEquipment(entry.weaponId, equipment)) ||
          entry.weaponCategory === equipment.category,
      )
    case 'armor':
      return proficiencies.armor.some((entry) => entry.armorCategory === equipment.category)
    case 'tool':
      return isToolProficient({ equipment, proficiencies: proficiencies.tools })
    default:
      return true
  }
}
