import type { Equipment } from '../../../../content/equipment'
import { isToolProficient, isWeaponProficient } from '../../../creature/proficiencies'
import type { CharacterProficiencies } from '../../../character/sheet/proficiencies'

/** Returns true when the character's assembled proficiencies cover this equipment row. */
export function isEquipmentProficient(
  equipment: Equipment,
  proficiencies: CharacterProficiencies,
): boolean {
  switch (equipment.kind) {
    case 'weapon':
      return isWeaponProficient(equipment, proficiencies.weapons)
    case 'armor':
      return proficiencies.armor.some((entry) => entry.armorCategory === equipment.category)
    case 'tool':
      return isToolProficient({ equipment, proficiencies: proficiencies.tools })
    default:
      return true
  }
}
