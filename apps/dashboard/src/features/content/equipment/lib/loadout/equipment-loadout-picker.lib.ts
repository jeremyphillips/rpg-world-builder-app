import {
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  isEquipmentPickerSupportedKind,
  type Equipment,
  type EquipmentPickerItem,
} from '@rpg/contracts'

/** Minimal picker rows for loadout workflow (no purchase or proficiency gates). */
export function buildLoadoutEquipmentPickerItems(
  equipment: readonly Equipment[],
): EquipmentPickerItem[] {
  return equipment
    .filter((row) => isEquipmentPickerSupportedKind(row.kind))
    .map((row) => ({
      equipment: row,
      state: {
        isAvailable: true,
        isRecommended: false,
        isProficient: true,
        isWithinRemainingBudget: true,
        purchaseAvailability: { status: 'available' as const },
        recommendation: NEUTRAL_EQUIPMENT_RECOMMENDATION,
        disabledReasons: [],
      },
    }))
}
