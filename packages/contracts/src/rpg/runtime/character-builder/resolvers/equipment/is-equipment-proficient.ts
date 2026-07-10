import type { Equipment } from '../../../../content/equipment'
import { isToolProficient } from '../../../creature/proficiencies'
import type { CharacterProficiencies } from '../../../character/proficiencies'

/** Returns true when the character's assembled proficiencies cover this equipment row. */
export function isEquipmentProficient(
  equipment: Equipment,
  proficiencies: CharacterProficiencies,
): boolean {
  switch (equipment.kind) {
    case 'weapon':
      return proficiencies.weapons.some(
        (entry) => entry.weaponId === equipment.id || entry.weaponCategory === equipment.category,
      )
    case 'armor':
      return proficiencies.armor.some((entry) => entry.armorCategory === equipment.category)
    case 'tool':
      return isToolProficient({ equipment, proficiencies: proficiencies.tools })
    default:
      return true
  }
}
