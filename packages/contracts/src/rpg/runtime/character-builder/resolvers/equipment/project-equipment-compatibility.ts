import type { Equipment } from '../../../../content/equipment'
import type { CharacterProficiencies } from '../../../character/sheet/proficiencies'
import { isEquipmentProficient } from './is-equipment-proficient'

export type EquipmentCompatibility = {
  /**
   * Undefined when proficiency is not meaningful for this item.
   * True or false when it is meaningful and known.
   */
  proficient?: boolean
}

function equipmentTracksProficiency(equipment: Equipment): boolean {
  return equipment.kind === 'weapon' || equipment.kind === 'armor' || equipment.kind === 'tool'
}

/** Proficiency compatibility from the character and the equipment row. Not a recommendation. */
export function projectEquipmentCompatibility(
  equipment: Equipment,
  proficiencies: CharacterProficiencies,
): EquipmentCompatibility {
  if (!equipmentTracksProficiency(equipment)) return {}
  return { proficient: isEquipmentProficient(equipment, proficiencies) }
}
