import {
  isArmorEquipment,
  isWeaponEquipment,
  type Equipment,
  type ToolEquipment,
} from '@rpg/contracts'

/** Canonical dimension slugs for combobox filterValues and row metadata comparisons. */
export function resolveEquipmentFilterValues(
  equipment: Equipment,
): Readonly<Record<string, string>> | undefined {
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
