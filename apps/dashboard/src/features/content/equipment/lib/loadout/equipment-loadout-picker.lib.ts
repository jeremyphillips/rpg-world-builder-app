import {
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  isEquipmentPickerSupportedKind,
  type Equipment,
  type EquipmentPickerItem,
} from '@rpg/contracts'

export type BuildLoadoutEquipmentPickerItemsOptions = {
  resolveIsProficient?: (equipment: Equipment) => boolean
}

/** Minimal picker rows for loadout workflow (no purchase or proficiency gates). */
export function buildLoadoutEquipmentPickerItems(
  equipment: readonly Equipment[],
  options?: BuildLoadoutEquipmentPickerItemsOptions,
): EquipmentPickerItem[] {
  const resolveIsProficient = options?.resolveIsProficient ?? (() => true)
  return equipment
    .filter((row) => isEquipmentPickerSupportedKind(row.kind))
    .map((row) => ({
      equipment: row,
      state: {
        isAvailable: true,
        isRecommended: false,
        isProficient: resolveIsProficient(row),
        isWithinRemainingBudget: true,
        purchaseAvailability: { status: 'available' as const },
        recommendation: NEUTRAL_EQUIPMENT_RECOMMENDATION,
        disabledReasons: [],
      },
    }))
}
