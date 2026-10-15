import {
  isArmorEquipment,
  isWeaponEquipment,
  type Equipment,
  type ToolEquipment,
} from '@rpg/contracts'

/** Normalized weapon / armor / tool dimension slugs shared by combobox and picker match boundaries. */
export type EquipmentGrantFilterDimensions = Readonly<Record<string, string>>

export function resolveEquipmentGrantFilterDimensions(
  equipment: Equipment,
): EquipmentGrantFilterDimensions | undefined {
  if (isWeaponEquipment(equipment)) {
    return {
      category: equipment.category,
      mode: equipment.mode,
    }
  }

  if (isArmorEquipment(equipment)) {
    return {
      category: equipment.category,
      stealth: equipment.stealthDisadvantage ? 'disadvantage' : 'none',
    }
  }

  if (equipment.kind === 'tool') {
    const tool = equipment as ToolEquipment
    return { category: tool.toolCategory }
  }

  return undefined
}

/** Adapter for form combobox `FieldOption.filterValues` (same slugs as grant dimensions). */
export function resolveEquipmentComboboxFilterValues(
  equipment: Equipment,
): EquipmentGrantFilterDimensions | undefined {
  return resolveEquipmentGrantFilterDimensions(equipment)
}
